import { PartialType } from '@nestjs/swagger';
import { CreateTacheDto } from './create-tache.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatutTache } from '../entities/tache.entity';

export class UpdateTacheDto extends PartialType(CreateTacheDto) {
  @ApiPropertyOptional({ description: 'Statut de la tâche', enum: StatutTache })
  @IsEnum(StatutTache)
  @IsOptional()
  statut?: StatutTache;
}
