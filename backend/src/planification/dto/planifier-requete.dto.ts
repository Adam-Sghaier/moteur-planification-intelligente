import { IsUUID, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PlanifierRequeteDto {
  @ApiPropertyOptional({ description: 'ID de la tâche à planifier' })
  @IsUUID()
  @IsOptional()
  tacheId?: string;

  @ApiPropertyOptional({ description: 'Date préférée pour la planification' })
  @IsDateString()
  @IsOptional()
  datePreferee?: string;

  @ApiPropertyOptional({ description: 'Assignation automatique', default: true })
  @IsBoolean()
  @IsOptional()
  autoAssigner?: boolean;
}
