import { PrioriteTache } from '../../taches/entities/tache.entity';
import { Affectation } from '../../affectations/entities/affectation.entity';

export interface IScoreTechnicien {
  technicienId: string;
  score: number;
  facteurs: {
    correspondanceCompetences: number;
    correspondanceLocalisation: number;
    disponibilite: number;
    equilibreCharge: number;
  };
}

export interface IConflitPlanification {
  type: 'CHEVAUCHEMENT' | 'AUCUN_TECHNICIEN_QUALIFIE' | 'URGENTE_NON_ASSIGNEE' | 'DEPASSEMENT_CAPACITE';
  message: string;
  tacheId?: string;
  technicienId?: string;
}

export interface IResultatPlanification {
  succes: boolean;
  affectation?: Affectation;
  conflits?: IConflitPlanification[];
  suggestions?: string[];
}
