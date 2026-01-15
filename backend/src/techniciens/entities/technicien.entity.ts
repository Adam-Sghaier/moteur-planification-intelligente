import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Affectation } from '../../affectations/entities/affectation.entity';

@Entity('techniciens')
export class Technicien {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ unique: true })
  email: string;

  @Column('text', { array: true, default: [] })
  competences: string[];

  @Column({ nullable: true })
  localisation: string;

  @Column({ default: true })
  estActif: boolean;

  @Column({ default: 40 })
  limiteHeuresHebdo: number;

  @OneToMany(() => Affectation, (affectation) => affectation.technicien)
  affectations: Affectation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
