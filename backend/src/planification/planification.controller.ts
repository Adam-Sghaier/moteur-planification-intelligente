import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlanificationService } from './planification.service';
import { PlanifierRequeteDto } from './dto/planifier-requete.dto';
import { AssignerManuellementDto } from './dto/assigner-manuellement.dto';
import { PlanifierReponseDto, ConflitDto } from './dto/planifier-reponse.dto';
import { EnvoyerPlanningDto, EnvoyerPlanningResponseDto } from './dto/envoyer-planning.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Planification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/planification')
export class PlanificationController {
  constructor(private readonly planificationService: PlanificationService) { }

  @Post('auto-assigner')
  @ApiOperation({ summary: 'Assignation automatique d\'une tâche' })
  @ApiResponse({ status: 201, description: 'Résultat de la planification', type: PlanifierReponseDto })
  autoAssigner(@Body() dto: PlanifierRequeteDto) {
    return this.planificationService.autoAssigner(dto);
  }

  @Post('assigner')
  @ApiOperation({ summary: 'Assignation manuelle d\'une tâche à un technicien' })
  @ApiResponse({ status: 201, description: 'Résultat de l\'assignation', type: PlanifierReponseDto })
  assignerManuellement(@Body() dto: AssignerManuellementDto) {
    return this.planificationService.assignerManuellement(dto);
  }

  @Get('conflits')
  @ApiOperation({ summary: 'Détecter tous les conflits de planification' })
  @ApiResponse({ status: 200, description: 'Liste des conflits', type: [ConflitDto] })
  detecterConflits() {
    return this.planificationService.detecterConflits();
  }

  @Post('reaffecter/:tacheId')
  @ApiOperation({ summary: 'Réaffectation automatique après annulation' })
  @ApiResponse({ status: 201, description: 'Résultat de la réaffectation', type: PlanifierReponseDto })
  reaffecter(@Param('tacheId', ParseUUIDPipe) tacheId: string) {
    return this.planificationService.reaffecter(tacheId);
  }

  @Get('optimiser')
  @ApiOperation({ summary: 'Optimisation globale des affectations' })
  @ApiResponse({ status: 200, description: 'Résultat de l\'optimisation' })
  optimiser() {
    return this.planificationService.optimiser();
  }

  @Post('envoyer-planning')
  @ApiOperation({ summary: 'Envoyer le planning par email au technicien' })
  @ApiResponse({ status: 201, description: 'Résultat de l\'envoi', type: EnvoyerPlanningResponseDto })
  envoyerPlanning(@Body() dto: EnvoyerPlanningDto) {
    return this.planificationService.envoyerPlanningParEmail(dto.technicienId);
  }

  @Get('export/:technicienId')
  @ApiOperation({ summary: 'Exporter le planning d\'un technicien (données JSON)' })
  @ApiResponse({ status: 200, description: 'Planning du technicien' })
  exporterPlanning(@Param('technicienId', ParseUUIDPipe) technicienId: string) {
    return this.planificationService.exporterPlanning(technicienId);
  }
}
