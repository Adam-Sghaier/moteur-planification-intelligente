import { StatutAffectation } from '../entities/affectation.entity';

export interface IAffectation {
  id: string;
  technicienId: string;
  tacheId: string;
  heureDebut: Date;
  heureFin: Date;
  statut: StatutAffectation;
  assigneeLe: Date;
}
