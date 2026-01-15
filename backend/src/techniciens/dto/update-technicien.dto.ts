import { PartialType } from '@nestjs/swagger';
import { CreateTechnicienDto } from './create-technicien.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTechnicienDto extends PartialType(CreateTechnicienDto) {
  @ApiPropertyOptional({ description: 'Statut actif du technicien', example: true })
  @IsBoolean()
  @IsOptional()
  estActif?: boolean;
}
