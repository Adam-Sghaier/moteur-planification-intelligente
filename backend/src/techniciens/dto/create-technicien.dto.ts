import { IsString, IsEmail, IsArray, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTechnicienDto {
  @ApiProperty({ description: 'Nom du technicien', example: 'Jean Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ description: 'Email du technicien', example: 'jean.dupont@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Liste des compétences', example: ['électricité', 'plomberie'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  competences?: string[];

  @ApiPropertyOptional({ description: 'Localisation du technicien', example: 'Paris' })
  @IsString()
  @IsOptional()
  localisation?: string;

  @ApiPropertyOptional({ description: 'Limite heures hebdomadaires', example: 40, default: 40 })
  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  limiteHeuresHebdo?: number;
}
