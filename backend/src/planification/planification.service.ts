import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Affectation, StatutAffectation } from '../affectations/entities/affectation.entity';
import { Tache, StatutTache, PrioriteTache } from '../taches/entities/tache.entity';
import { Technicien } from '../techniciens/entities/technicien.entity';
import { TechniciensService } from '../techniciens/techniciens.service';
import { TachesService } from '../taches/taches.service';
import { DetecteurConflits } from './conflits/detecteur-conflits.service';
import { AlgorithmeScoring } from './algorithmes/scoring.algorithme';
import { PlanifierRequeteDto } from './dto/planifier-requete.dto';
import { AssignerManuellementDto } from './dto/assigner-manuellement.dto';
import { PlanifierReponseDto, ConflitDto } from './dto/planifier-reponse.dto';
import { IConflitPlanification } from './interfaces/planification.interface';

@Injectable()
export class PlanificationService {
  constructor(
    @InjectRepository(Affectation)
    private readonly affectationRepository: Repository<Affectation>,
    @InjectRepository(Tache)
    private readonly tacheRepository: Repository<Tache>,
    @InjectRepository(Technicien)
    private readonly technicienRepository: Repository<Technicien>,
    private readonly techniciensService: TechniciensService,
    private readonly tachesService: TachesService,
    private readonly detecteurConflits: DetecteurConflits,
    private readonly algorithmeScoring: AlgorithmeScoring,
  ) { }

  /**
   * Assignation automatique d'une tâche au meilleur technicien
   */
  async autoAssigner(dto: PlanifierRequeteDto): Promise<PlanifierReponseDto> {
    if (!dto.tacheId) {
      throw new BadRequestException('ID de tâche requis');
    }

    const tache = await this.tachesService.findOne(dto.tacheId);
    if (tache.statut !== StatutTache.EN_ATTENTE) {
      throw new BadRequestException('La tâche doit être en attente');
    }

    // Récupérer tous les techniciens actifs
    const techniciens = await this.technicienRepository.find({
      where: { estActif: true },
    });

    if (techniciens.length === 0) {
      return {
        succes: false,
        conflits: [{
          type: 'AUCUN_TECHNICIEN_QUALIFIE',
          message: 'Aucun technicien actif disponible',
        }],
      };
    }

    // Filtrer les techniciens qualifiés
    const techniciensQualifies: { technicien: Technicien; heuresUtilisees: number }[] = [];

    for (const tech of techniciens) {
      const estQualifie = await this.detecteurConflits.verifierCompetences(
        tech.id,
        tache.competencesRequises,
      );

      if (estQualifie) {
        const dispo = await this.techniciensService.getDisponibilite(tech.id);
        const capaciteOk = await this.detecteurConflits.verifierCapaciteHebdo(
          tech.id,
          tache.dureeEstimee,
        );

        if (capaciteOk) {
          techniciensQualifies.push({
            technicien: tech,
            heuresUtilisees: dispo.heuresUtiliseesSemaine,
          });
        }
      }
    }

    if (techniciensQualifies.length === 0) {
      return {
        succes: false,
        conflits: [{
          type: 'AUCUN_TECHNICIEN_QUALIFIE',
          message: 'Aucun technicien qualifié avec capacité disponible',
          tacheId: tache.id,
        }],
        suggestions: ['Vérifiez les compétences des techniciens', 'Augmentez la capacité horaire'],
      };
    }

    // Calculer les scores et trier
    const scores = techniciensQualifies.map(({ technicien, heuresUtilisees }) =>
      this.algorithmeScoring.calculerScore(technicien, tache, heuresUtilisees),
    );
    const scoresTriees = this.algorithmeScoring.trierParScore(scores);

    // Sélectionner le meilleur technicien
    const meilleurId = scoresTriees[0].technicienId;
    const meilleurTechnicien = techniciensQualifies.find(
      t => t.technicien.id === meilleurId,
    )!.technicien;

    // Calculer les heures
    const heureDebut = dto.datePreferee ? new Date(dto.datePreferee) : new Date();
    const heureFin = new Date(heureDebut.getTime() + tache.dureeEstimee * 60 * 1000);

    // Vérifier le chevauchement
    const chevauchement = await this.detecteurConflits.detecterChevauchement(
      meilleurId,
      heureDebut,
      heureFin,
    );

    if (chevauchement) {
      return {
        succes: false,
        conflits: [{
          type: 'CHEVAUCHEMENT',
          message: 'Conflit horaire avec une autre affectation',
          technicienId: meilleurId,
          tacheId: tache.id,
        }],
        suggestions: ['Choisissez une autre date/heure'],
      };
    }

    // Créer l'affectation
    const affectation = this.affectationRepository.create({
      technicienId: meilleurId,
      tacheId: tache.id,
      heureDebut,
      heureFin,
      statut: StatutAffectation.PLANIFIEE,
    });

    await this.affectationRepository.save(affectation);

    // Mettre à jour le statut de la tâche
    tache.statut = StatutTache.ASSIGNEE;
    tache.debutPlanifie = heureDebut;
    tache.finPlanifiee = heureFin;
    await this.tacheRepository.save(tache);

    return {
      succes: true,
      affectation,
      message: `Tâche assignée à ${meilleurTechnicien.nom} avec un score de ${scoresTriees[0].score.toFixed(2)}`,
    };
  }

  /**
   * Assignation manuelle d'une tâche
   */
  async assignerManuellement(dto: AssignerManuellementDto): Promise<PlanifierReponseDto> {
    const tache = await this.tachesService.findOne(dto.tacheId);
    const technicien = await this.techniciensService.findOne(dto.technicienId);

    const heureDebut = new Date(dto.heureDebut);
    const heureFin = new Date(heureDebut.getTime() + tache.dureeEstimee * 60 * 1000);

    // Vérifications
    const estQualifie = await this.detecteurConflits.verifierCompetences(
      dto.technicienId,
      tache.competencesRequises,
    );

    if (!estQualifie) {
      return {
        succes: false,
        conflits: [{
          type: 'AUCUN_TECHNICIEN_QUALIFIE',
          message: 'Le technicien ne possède pas les compétences requises',
          technicienId: dto.technicienId,
          tacheId: dto.tacheId,
        }],
      };
    }

    const chevauchement = await this.detecteurConflits.detecterChevauchement(
      dto.technicienId,
      heureDebut,
      heureFin,
    );

    if (chevauchement) {
      return {
        succes: false,
        conflits: [{
          type: 'CHEVAUCHEMENT',
          message: 'Conflit horaire avec une autre affectation',
          technicienId: dto.technicienId,
        }],
      };
    }

    const capaciteOk = await this.detecteurConflits.verifierCapaciteHebdo(
      dto.technicienId,
      tache.dureeEstimee,
    );

    if (!capaciteOk) {
      return {
        succes: false,
        conflits: [{
          type: 'DEPASSEMENT_CAPACITE',
          message: 'Dépassement de la capacité horaire hebdomadaire',
          technicienId: dto.technicienId,
        }],
      };
    }

    // Créer l'affectation
    const affectation = this.affectationRepository.create({
      technicienId: dto.technicienId,
      tacheId: dto.tacheId,
      heureDebut,
      heureFin,
      statut: StatutAffectation.PLANIFIEE,
    });

    await this.affectationRepository.save(affectation);

    // Mettre à jour la tâche
    tache.statut = StatutTache.ASSIGNEE;
    tache.debutPlanifie = heureDebut;
    tache.finPlanifiee = heureFin;
    await this.tacheRepository.save(tache);

    return {
      succes: true,
      affectation,
      message: `Tâche assignée manuellement à ${technicien.nom}`,
    };
  }

  /**
   * Détecte tous les conflits
   */
  async detecterConflits(): Promise<ConflitDto[]> {
    return this.detecteurConflits.detecterTousLesConflits();
  }

  /**
   * Réaffectation automatique après annulation
   */
  async reaffecter(tacheId: string): Promise<PlanifierReponseDto> {
    const tache = await this.tachesService.findOne(tacheId);

    // Annuler l'affectation existante si elle existe
    const affectationExistante = await this.affectationRepository.findOne({
      where: { tacheId },
    });

    if (affectationExistante) {
      affectationExistante.statut = StatutAffectation.ANNULEE;
      await this.affectationRepository.save(affectationExistante);
    }

    // Remettre la tâche en attente
    tache.statut = StatutTache.EN_ATTENTE;
    await this.tacheRepository.save(tache);

    // Tenter une nouvelle assignation automatique
    return this.autoAssigner({ tacheId, autoAssigner: true });
  }

  /**
   * Optimisation globale - réorganise toutes les affectations
   */
  async optimiser(): Promise<{ message: string; affectationsOptimisees: number }> {
    const tachesEnAttente = await this.tacheRepository.find({
      where: { statut: StatutTache.EN_ATTENTE },
      order: { priorite: 'DESC', createdAt: 'ASC' },
    });

    let affectationsReussies = 0;

    for (const tache of tachesEnAttente) {
      const resultat = await this.autoAssigner({ tacheId: tache.id });
      if (resultat.succes) {
        affectationsReussies++;
      }
    }

    return {
      message: `Optimisation terminée`,
      affectationsOptimisees: affectationsReussies,
    };
  }

  /**
   * Exporter le planning d'un technicien
   */
  async exporterPlanning(technicienId: string): Promise<{
    technicien: Technicien;
    affectations: Array<{
      id: string;
      tacheTitre: string;
      tacheDescription?: string;
      date: string;
      heureDebut: string;
      heureFin: string;
      dureeMinutes: number;
      localisation?: string;
      competences: string[];
      priorite: string;
      statut: string;
    }>;
  }> {
    const technicien = await this.techniciensService.findOne(technicienId);
    const affectations = await this.affectationRepository.find({
      where: {
        technicienId,
        statut: StatutAffectation.PLANIFIEE,
      },
      relations: ['tache'],
      order: { heureDebut: 'ASC' },
    });

    const formattedAffectations = affectations.map(aff => ({
      id: aff.id,
      tacheTitre: aff.tache?.titre || 'Sans titre',
      tacheDescription: aff.tache?.description,
      date: new Date(aff.heureDebut).toLocaleDateString('fr-FR'),
      heureDebut: new Date(aff.heureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      heureFin: new Date(aff.heureFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      dureeMinutes: aff.tache?.dureeEstimee || 0,
      localisation: aff.tache?.localisation,
      competences: aff.tache?.competencesRequises || [],
      priorite: aff.tache?.priorite || 'MOYENNE',
      statut: aff.statut,
    }));

    return {
      technicien,
      affectations: formattedAffectations,
    };
  }

  /**
   * Envoyer le planning par email
   */
  async envoyerPlanningParEmail(technicienId: string): Promise<{
    success: boolean;
    message: string;
    previewUrl?: string;
  }> {
    const { technicien, affectations } = await this.exporterPlanning(technicienId);

    // Note: Pour un vrai envoi d'email, il faudrait injecter EmailService
    // Pour la démo, on retourne juste les données formatées
    return {
      success: true,
      message: `Email simulé envoyé à ${technicien.email} avec ${affectations.length} interventions`,
      previewUrl: undefined,
    };
  }
}

