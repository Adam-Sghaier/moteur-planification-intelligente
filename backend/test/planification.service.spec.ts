import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanificationService } from '../src/planification/planification.service';
import { DetecteurConflits } from '../src/planification/conflits/detecteur-conflits.service';
import { AlgorithmeScoring } from '../src/planification/algorithmes/scoring.algorithme';
import { TechniciensService } from '../src/techniciens/techniciens.service';
import { TachesService } from '../src/taches/taches.service';
import { Affectation, StatutAffectation } from '../src/affectations/entities/affectation.entity';
import { Tache, StatutTache, PrioriteTache } from '../src/taches/entities/tache.entity';
import { Technicien } from '../src/techniciens/entities/technicien.entity';

describe('PlanificationService', () => {
  let service: PlanificationService;
  let detecteurConflits: DetecteurConflits;
  let algorithmeScoring: AlgorithmeScoring;
  let affectationRepository: Repository<Affectation>;
  let tacheRepository: Repository<Tache>;
  let technicienRepository: Repository<Technicien>;

  const mockTechnicien: Partial<Technicien> = {
    id: 'tech-1',
    nom: 'Jean Dupont',
    email: 'jean@example.com',
    competences: ['électricité', 'plomberie'],
    localisation: 'Paris',
    estActif: true,
    limiteHeuresHebdo: 40,
    affectations: [],
  };

  const mockTache: Partial<Tache> = {
    id: 'tache-1',
    titre: 'Réparation électrique',
    competencesRequises: ['électricité'],
    dureeEstimee: 120,
    priorite: PrioriteTache.MOYENNE,
    statut: StatutTache.EN_ATTENTE,
    localisation: 'Paris',
  };

  const mockAffectation: Partial<Affectation> = {
    id: 'aff-1',
    technicienId: 'tech-1',
    tacheId: 'tache-1',
    heureDebut: new Date(),
    heureFin: new Date(Date.now() + 120 * 60 * 1000),
    statut: StatutAffectation.PLANIFIEE,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanificationService,
        DetecteurConflits,
        AlgorithmeScoring,
        {
          provide: TechniciensService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockTechnicien),
            getDisponibilite: jest.fn().mockResolvedValue({
              technicienId: 'tech-1',
              heuresUtiliseesSemaine: 20,
              heuresRestantesSemaine: 20,
            }),
          },
        },
        {
          provide: TachesService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockTache),
          },
        },
        {
          provide: getRepositoryToken(Affectation),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue(mockAffectation),
            save: jest.fn().mockResolvedValue(mockAffectation),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(0),
            }),
          },
        },
        {
          provide: getRepositoryToken(Tache),
          useValue: {
            find: jest.fn().mockResolvedValue([mockTache]),
            findOne: jest.fn().mockResolvedValue(mockTache),
            save: jest.fn().mockResolvedValue(mockTache),
          },
        },
        {
          provide: getRepositoryToken(Technicien),
          useValue: {
            find: jest.fn().mockResolvedValue([mockTechnicien]),
            findOne: jest.fn().mockResolvedValue(mockTechnicien),
          },
        },
      ],
    }).compile();

    service = module.get<PlanificationService>(PlanificationService);
    detecteurConflits = module.get<DetecteurConflits>(DetecteurConflits);
    algorithmeScoring = module.get<AlgorithmeScoring>(AlgorithmeScoring);
    affectationRepository = module.get<Repository<Affectation>>(getRepositoryToken(Affectation));
    tacheRepository = module.get<Repository<Tache>>(getRepositoryToken(Tache));
    technicienRepository = module.get<Repository<Technicien>>(getRepositoryToken(Technicien));
  });

  describe('autoAssigner', () => {
    it('devrait assigner une tâche au meilleur technicien disponible', async () => {
      const result = await service.autoAssigner({ tacheId: 'tache-1' });

      expect(result.succes).toBe(true);
      expect(result.affectation).toBeDefined();
    });

    it('devrait retourner une erreur si aucun technicien qualifié', async () => {
      jest.spyOn(technicienRepository, 'find').mockResolvedValue([]);

      const result = await service.autoAssigner({ tacheId: 'tache-1' });

      expect(result.succes).toBe(false);
      expect(result.conflits).toBeDefined();
      expect(result.conflits![0].type).toBe('AUCUN_TECHNICIEN_QUALIFIE');
    });

    it('devrait détecter un conflit de chevauchement horaire', async () => {
      jest.spyOn(detecteurConflits, 'detecterChevauchement').mockResolvedValue(true);

      const result = await service.autoAssigner({ tacheId: 'tache-1' });

      expect(result.succes).toBe(false);
      expect(result.conflits![0].type).toBe('CHEVAUCHEMENT');
    });
  });

  describe('assignerManuellement', () => {
    it('devrait assigner manuellement une tâche à un technicien', async () => {
      const result = await service.assignerManuellement({
        tacheId: 'tache-1',
        technicienId: 'tech-1',
        heureDebut: new Date().toISOString(),
      });

      expect(result.succes).toBe(true);
    });

    it('devrait rejeter si le technicien n\'a pas les compétences', async () => {
      jest.spyOn(detecteurConflits, 'verifierCompetences').mockResolvedValue(false);

      const result = await service.assignerManuellement({
        tacheId: 'tache-1',
        technicienId: 'tech-1',
        heureDebut: new Date().toISOString(),
      });

      expect(result.succes).toBe(false);
      expect(result.conflits![0].type).toBe('AUCUN_TECHNICIEN_QUALIFIE');
    });
  });

  describe('detecterConflits', () => {
    it('devrait détecter les tâches urgentes non assignées', async () => {
      const urgentTache = { ...mockTache, priorite: PrioriteTache.URGENTE };
      jest.spyOn(tacheRepository, 'find').mockResolvedValue([urgentTache as Tache]);

      const conflits = await service.detecterConflits();

      const urgentConflits = conflits.filter(c => c.type === 'URGENTE_NON_ASSIGNEE');
      expect(urgentConflits.length).toBeGreaterThan(0);
    });
  });

  describe('reaffecter', () => {
    it('devrait annuler l\'affectation existante et en créer une nouvelle', async () => {
      jest.spyOn(affectationRepository, 'findOne').mockResolvedValue(mockAffectation as Affectation);

      const result = await service.reaffecter('tache-1');

      expect(affectationRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});

describe('AlgorithmeScoring', () => {
  let algorithme: AlgorithmeScoring;

  beforeEach(() => {
    algorithme = new AlgorithmeScoring();
  });

  it('devrait calculer un score élevé pour une correspondance parfaite', () => {
    const technicien = {
      id: 'tech-1',
      competences: ['électricité', 'plomberie'],
      localisation: 'Paris',
      limiteHeuresHebdo: 40,
    } as Technicien;

    const tache = {
      competencesRequises: ['électricité'],
      localisation: 'Paris',
    } as Tache;

    const score = algorithme.calculerScore(technicien, tache, 0);

    expect(score.score).toBeGreaterThan(0.8);
    expect(score.facteurs.correspondanceCompetences).toBe(1);
    expect(score.facteurs.correspondanceLocalisation).toBe(1);
  });

  it('devrait calculer un score faible sans correspondance de compétences', () => {
    const technicien = {
      id: 'tech-1',
      competences: ['peinture'],
      localisation: 'Lyon',
      limiteHeuresHebdo: 40,
    } as Technicien;

    const tache = {
      competencesRequises: ['électricité'],
      localisation: 'Paris',
    } as Tache;

    const score = algorithme.calculerScore(technicien, tache, 0);

    expect(score.facteurs.correspondanceCompetences).toBe(0);
    expect(score.facteurs.correspondanceLocalisation).toBe(0);
  });
});
