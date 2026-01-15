import { Injectable } from '@nestjs/common';
import { Technicien } from '../../techniciens/entities/technicien.entity';
import { Tache } from '../../taches/entities/tache.entity';
import { IScoreTechnicien } from '../interfaces/planification.interface';

@Injectable()
export class AlgorithmeScoring {
  /**
   * Calcule un score pour un technicien par rapport à une tâche
   * Basé sur plusieurs facteurs pondérés
   */
  calculerScore(technicien: Technicien, tache: Tache, heuresUtiliseesSemaine: number): IScoreTechnicien {
    const facteurs = {
      correspondanceCompetences: this.calculerCorrespondanceCompetences(
        technicien.competences,
        tache.competencesRequises,
      ),
      correspondanceLocalisation: this.calculerCorrespondanceLocalisation(
        technicien.localisation,
        tache.localisation,
      ),
      disponibilite: this.calculerScoreDisponibilite(technicien, heuresUtiliseesSemaine),
      equilibreCharge: this.calculerEquilibreCharge(technicien, heuresUtiliseesSemaine),
    };

    // Pondération des facteurs
    const poids = {
      correspondanceCompetences: 0.40,
      correspondanceLocalisation: 0.20,
      disponibilite: 0.25,
      equilibreCharge: 0.15,
    };

    const score =
      facteurs.correspondanceCompetences * poids.correspondanceCompetences +
      facteurs.correspondanceLocalisation * poids.correspondanceLocalisation +
      facteurs.disponibilite * poids.disponibilite +
      facteurs.equilibreCharge * poids.equilibreCharge;

    return {
      technicienId: technicien.id,
      score,
      facteurs,
    };
  }

  /**
   * Calcule le pourcentage de compétences correspondantes
   */
  private calculerCorrespondanceCompetences(
    competencesTechnicien: string[],
    competencesRequises: string[],
  ): number {
    if (competencesRequises.length === 0) return 1;

    const competencesNormalisees = competencesTechnicien.map(c => c.toLowerCase().trim());
    const requisesNormalisees = competencesRequises.map(c => c.toLowerCase().trim());

    const correspondances = requisesNormalisees.filter(r =>
      competencesNormalisees.includes(r),
    ).length;

    return correspondances / requisesNormalisees.length;
  }

  /**
   * Calcule la correspondance de localisation
   */
  private calculerCorrespondanceLocalisation(
    localisationTechnicien: string | null,
    localisationTache: string | null,
  ): number {
    if (!localisationTache || !localisationTechnicien) return 0.5;

    return localisationTechnicien.toLowerCase().trim() === localisationTache.toLowerCase().trim()
      ? 1
      : 0;
  }

  /**
   * Calcule un score de disponibilité basé sur les heures restantes
   */
  private calculerScoreDisponibilite(technicien: Technicien, heuresUtilisees: number): number {
    const heuresRestantes = technicien.limiteHeuresHebdo - heuresUtilisees;
    const ratio = heuresRestantes / technicien.limiteHeuresHebdo;
    return Math.max(0, Math.min(1, ratio));
  }

  /**
   * Favorise les techniciens avec moins de charge pour équilibrer
   */
  private calculerEquilibreCharge(technicien: Technicien, heuresUtilisees: number): number {
    const tauxUtilisation = heuresUtilisees / technicien.limiteHeuresHebdo;
    // Plus le taux est bas, plus le score est élevé
    return 1 - tauxUtilisation;
  }

  /**
   * Trie les techniciens par score décroissant
   */
  trierParScore(scores: IScoreTechnicien[]): IScoreTechnicien[] {
    return [...scores].sort((a, b) => b.score - a.score);
  }
}
