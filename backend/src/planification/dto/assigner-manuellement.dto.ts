import { IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignerManuellementDto {
  @ApiProperty({ description: 'ID de la tâche' })
  @IsUUID()
  tacheId: string;

  @ApiProperty({ description: 'ID du technicien' })
  @IsUUID()
  technicienId: string;

  @ApiProperty({ description: 'Heure de début' })
  @IsDateString()
  heureDebut: string;
}
