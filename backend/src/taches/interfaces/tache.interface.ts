import { PrioriteTache, StatutTache } from '../entities/tache.entity';

export interface ITache {
  id: string;
  titre: string;
  description?: string;
  competencesRequises: string[];
  localisation?: string;
  dureeEstimee: number;
  priorite: PrioriteTache;
  statut: StatutTache;
  debutPlanifie?: Date;
  finPlanifiee?: Date;
}
