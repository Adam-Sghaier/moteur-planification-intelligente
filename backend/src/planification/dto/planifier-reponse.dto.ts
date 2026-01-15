import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Affectation } from '../../affectations/entities/affectation.entity';

export class ConflitDto {
  @ApiProperty({ enum: ['CHEVAUCHEMENT', 'AUCUN_TECHNICIEN_QUALIFIE', 'URGENTE_NON_ASSIGNEE', 'DEPASSEMENT_CAPACITE'] })
  type: 'CHEVAUCHEMENT' | 'AUCUN_TECHNICIEN_QUALIFIE' | 'URGENTE_NON_ASSIGNEE' | 'DEPASSEMENT_CAPACITE';

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  tacheId?: string;

  @ApiPropertyOptional()
  technicienId?: string;
}

export class PlanifierReponseDto {
  @ApiProperty()
  succes: boolean;

  @ApiPropertyOptional()
  affectation?: Affectation;

  @ApiPropertyOptional({ type: [ConflitDto] })
  conflits?: ConflitDto[];

  @ApiPropertyOptional({ type: [String] })
  suggestions?: string[];

  @ApiPropertyOptional()
  message?: string;
}
