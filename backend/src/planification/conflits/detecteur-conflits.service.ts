import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Affectation, StatutAffectation } from '../../affectations/entities/affectation.entity';
import { Tache, StatutTache, PrioriteTache } from '../../taches/entities/tache.entity';
import { Technicien } from '../../techniciens/entities/technicien.entity';
import { IConflitPlanification } from '../interfaces/planification.interface';

@Injectable()
export class DetecteurConflits {
  constructor(
    @InjectRepository(Affectation)
    private readonly affectationRepository: Repository<Affectation>,
    @InjectRepository(Tache)
    private readonly tacheRepository: Repository<Tache>,
    @InjectRepository(Technicien)
    private readonly technicienRepository: Repository<Technicien>,
  ) { }

  /**
   * Détecte si le technicien a un chevauchement horaire
   */
  async detecterChevauchement(
    technicienId: string,
    heureDebut: Date,
    heureFin: Date,
    exclureAffectationId?: string,
  ): Promise<boolean> {
    const query = this.affectationRepository
      .createQueryBuilder('a')
      .where('a.technicienId = :technicienId', { technicienId })
      .andWhere('a.statut != :statut', { statut: StatutAffectation.ANNULEE })
      .andWhere('a.heureDebut < :heureFin', { heureFin })
      .andWhere('a.heureFin > :heureDebut', { heureDebut });

    if (exclureAffectationId) {
      query.andWhere('a.id != :exclureId', { exclureId: exclureAffectationId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Vérifie si le technicien possède les compétences requises
   */
  async verifierCompetences(technicienId: string, competencesRequises: string[]): Promise<boolean> {
    if (competencesRequises.length === 0) return true;

    const technicien = await this.technicienRepository.findOne({
      where: { id: technicienId },
    });

    if (!technicien) return false;

    const competencesNormalisees = technicien.competences.map(c => c.toLowerCase().trim());
    const requisesNormalisees = competencesRequises.map(c => c.toLowerCase().trim());

    return requisesNormalisees.every(requise =>
      competencesNormalisees.includes(requise),
    );
  }

  /**
   * Trouve les tâches urgentes non assignées
   */
  async trouverUrgentesNonAssignees(): Promise<Tache[]> {
    return this.tacheRepository.find({
      where: {
        priorite: PrioriteTache.URGENTE,
        statut: StatutTache.EN_ATTENTE,
      },
    });
  }

  /**
   * Vérifie si le technicien dépasse la capacité hebdomadaire
   */
  async verifierCapaciteHebdo(
    technicienId: string,
    minutesSupplementaires: number,
  ): Promise<boolean> {
    const technicien = await this.technicienRepository.findOne({
      where: { id: technicienId },
    });

    if (!technicien) return false;

    const debutSemaine = this.getDebutSemaine(new Date());
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(finSemaine.getDate() + 7);

    const affectations = await this.affectationRepository.find({
      where: {
        technicienId,
        statut: StatutAffectation.PLANIFIEE,
      },
    });

    const minutesUtilisees = affectations
      .filter(a => a.heureDebut >= debutSemaine && a.heureDebut < finSemaine)
      .reduce((total, a) => {
        const duree = (a.heureFin.getTime() - a.heureDebut.getTime()) / (1000 * 60);
        return total + duree;
      }, 0);

    const limiteMinutes = technicien.limiteHeuresHebdo * 60;
    return (minutesUtilisees + minutesSupplementaires) <= limiteMinutes;
  }

  /**
   * Détecte tous les conflits dans le système
   */
  async detecterTousLesConflits(): Promise<IConflitPlanification[]> {
    const conflits: IConflitPlanification[] = [];

    // 1. Tâches urgentes non assignées
    const urgentes = await this.trouverUrgentesNonAssignees();
    for (const tache of urgentes) {
      conflits.push({
        type: 'URGENTE_NON_ASSIGNEE',
        message: `Tâche urgente "${tache.titre}" non assignée`,
        tacheId: tache.id,
      });
    }

    // 2. Vérifier les dépassements de capacité
    const techniciens = await this.technicienRepository.find({ where: { estActif: true } });
    for (const tech of techniciens) {
      const capaciteOk = await this.verifierCapaciteHebdo(tech.id, 0);
      if (!capaciteOk) {
        conflits.push({
          type: 'DEPASSEMENT_CAPACITE',
          message: `Technicien "${tech.nom}" a dépassé sa capacité hebdomadaire`,
          technicienId: tech.id,
        });
      }
    }

    // 3. Vérifier tâches sans technicien qualifié
    const tachesEnAttente = await this.tacheRepository.find({
      where: { statut: StatutTache.EN_ATTENTE },
    });

    for (const tache of tachesEnAttente) {
      if (tache.competencesRequises.length > 0) {
        let technicienQualifie = false;
        for (const tech of techniciens) {
          if (await this.verifierCompetences(tech.id, tache.competencesRequises)) {
            technicienQualifie = true;
            break;
          }
        }
        if (!technicienQualifie) {
          conflits.push({
            type: 'AUCUN_TECHNICIEN_QUALIFIE',
            message: `Aucun technicien qualifié pour la tâche "${tache.titre}"`,
            tacheId: tache.id,
          });
        }
      }
    }

    return conflits;
  }

  private getDebutSemaine(date: Date): Date {
    const d = new Date(date);
    const jour = d.getDay();
    const diff = d.getDate() - jour + (jour === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
