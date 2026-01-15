import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanificationService } from './planification.service';
import { PlanificationController } from './planification.controller';
import { DetecteurConflits } from './conflits/detecteur-conflits.service';
import { AlgorithmeScoring } from './algorithmes/scoring.algorithme';
import { Affectation } from '../affectations/entities/affectation.entity';
import { Tache } from '../taches/entities/tache.entity';
import { Technicien } from '../techniciens/entities/technicien.entity';
import { TechniciensModule } from '../techniciens/techniciens.module';
import { TachesModule } from '../taches/taches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Affectation, Tache, Technicien]),
    TechniciensModule,
    TachesModule,
  ],
  controllers: [PlanificationController],
  providers: [PlanificationService, DetecteurConflits, AlgorithmeScoring],
  exports: [PlanificationService],
})
export class PlanificationModule { }
