import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Technicien } from '../../techniciens/entities/technicien.entity';
import { Tache } from '../../taches/entities/tache.entity';

export enum StatutAffectation {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

@Entity('affectations')
export class Affectation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Technicien, (technicien) => technicien.affectations)
  @JoinColumn({ name: 'technicien_id' })
  technicien: Technicien;

  @Column('uuid')
  technicienId: string;

  @OneToOne(() => Tache, (tache) => tache.affectation)
  @JoinColumn({ name: 'tache_id' })
  tache: Tache;

  @Column('uuid')
  tacheId: string;

  @Column()
  heureDebut: Date;

  @Column()
  heureFin: Date;

  @Column({ type: 'enum', enum: StatutAffectation, default: StatutAffectation.PLANIFIEE })
  statut: StatutAffectation;

  @CreateDateColumn()
  assigneeLe: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
