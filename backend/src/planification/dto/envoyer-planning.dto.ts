import { IsString, IsEmail, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AffectationEmailDto {
  @ApiProperty()
  @IsString()
  tacheTitre: string;

  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty()
  @IsString()
  heureDebut: string;

  @ApiProperty()
  @IsString()
  heureFin: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  localisation?: string;
}

export class EnvoyerPlanningDto {
  @ApiProperty({ description: 'ID du technicien' })
  @IsString()
  technicienId: string;
}

export class EnvoyerPlanningResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  messageId?: string;

  @ApiProperty({ required: false, description: 'URL de preview (Ethereal)' })
  previewUrl?: string;

  @ApiProperty({ required: false })
  message?: string;
}
