export enum PrioriteTache {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  URGENTE = 'URGENTE',
}

export enum StatutTache {
  EN_ATTENTE = 'EN_ATTENTE',
  ASSIGNEE = 'ASSIGNEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export enum StatutAffectation {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export interface Technicien {
  id: string;
  nom: string;
  email: string;
  competences: string[];
  localisation?: string;
  estActif: boolean;
  limiteHeuresHebdo: number;
}

export interface Tache {
  id: string;
  titre: string;
  description?: string;
  competencesRequises: string[];
  dureeEstimee: number;
  priorite: PrioriteTache;
  statut: StatutTache;
  localisation?: string;
  debutPlanifie?: string;
  finPlanifiee?: string;
}

export interface Affectation {
  id: string;
  technicienId: string;
  tacheId: string;
  heureDebut: string;
  heureFin: string;
  statut: StatutAffectation;
  technicien?: Technicien;
  tache?: Tache;
}

export interface Conflit {
  type: 'CHEVAUCHEMENT' | 'AUCUN_TECHNICIEN_QUALIFIE' | 'URGENTE_NON_ASSIGNEE' | 'DEPASSEMENT_CAPACITE';
  message: string;
  tacheId?: string;
  technicienId?: string;
}

export interface DisponibiliteTechnicien {
  technicienId: string;
  heuresUtiliseesSemaine: number;
  heuresRestantesSemaine: number;
}

export interface ResultatPlanification {
  succes: boolean;
  affectation?: Affectation;
  conflits?: Conflit[];
  suggestions?: string[];
  message?: string;
}
