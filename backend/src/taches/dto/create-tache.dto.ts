import { IsString, IsArray, IsOptional, IsInt, Min, Max, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrioriteTache } from '../entities/tache.entity';

export class CreateTacheDto {
  @ApiProperty({ description: 'Titre de la tâche', example: 'Réparation climatisation' })
  @IsString()
  titre: string;

  @ApiPropertyOptional({ description: 'Description de la tâche' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Compétences requises', example: ['climatisation', 'électricité'] })
  @IsArray()
  @IsString({ each: true })
  competencesRequises: string[];

  @ApiPropertyOptional({ description: 'Localisation de la tâche', example: 'Lyon' })
  @IsString()
  @IsOptional()
  localisation?: string;

  @ApiProperty({ description: 'Durée estimée en minutes', example: 120 })
  @IsInt()
  @Min(15)
  @Max(480)
  dureeEstimee: number;

  @ApiPropertyOptional({ description: 'Priorité de la tâche', enum: PrioriteTache })
  @IsEnum(PrioriteTache)
  @IsOptional()
  priorite?: PrioriteTache;

  @ApiPropertyOptional({ description: 'Date/heure de début planifiée' })
  @IsDateString()
  @IsOptional()
  debutPlanifie?: string;
}
