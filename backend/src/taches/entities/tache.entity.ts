import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Affectation } from '../../affectations/entities/affectation.entity';

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

@Entity('taches')
export class Tache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titre: string;

  @Column({ nullable: true })
  description: string;

  @Column('text', { array: true, default: [] })
  competencesRequises: string[];

  @Column({ nullable: true })
  localisation: string;

  @Column()
  dureeEstimee: number; // en minutes

  @Column({ type: 'enum', enum: PrioriteTache, default: PrioriteTache.MOYENNE })
  priorite: PrioriteTache;

  @Column({ type: 'enum', enum: StatutTache, default: StatutTache.EN_ATTENTE })
  statut: StatutTache;

  @Column({ nullable: true })
  debutPlanifie: Date;

  @Column({ nullable: true })
  finPlanifiee: Date;

  @OneToOne(() => Affectation, (affectation) => affectation.tache)
  affectation: Affectation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
