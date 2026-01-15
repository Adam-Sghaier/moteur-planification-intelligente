import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TachesService } from './taches.service';
import { CreateTacheDto } from './dto/create-tache.dto';
import { UpdateTacheDto } from './dto/update-tache.dto';
import { Tache } from './entities/tache.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tâches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/taches')
export class TachesController {
  constructor(private readonly tachesService: TachesService) { }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle tâche' })
  @ApiResponse({ status: 201, description: 'Tâche créée', type: Tache })
  create(@Body() createTacheDto: CreateTacheDto) {
    return this.tachesService.create(createTacheDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les tâches' })
  @ApiResponse({ status: 200, description: 'Liste des tâches', type: [Tache] })
  findAll() {
    return this.tachesService.findAll();
  }

  @Get('en-attente')
  @ApiOperation({ summary: 'Lister les tâches en attente d\'assignation' })
  @ApiResponse({ status: 200, description: 'Liste des tâches en attente', type: [Tache] })
  findEnAttente() {
    return this.tachesService.findEnAttente();
  }

  @Get('urgentes')
  @ApiOperation({ summary: 'Lister les tâches urgentes non assignées' })
  @ApiResponse({ status: 200, description: 'Liste des tâches urgentes', type: [Tache] })
  findUrgentes() {
    return this.tachesService.findUrgentesNonAssignees();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une tâche par son ID' })
  @ApiResponse({ status: 200, description: 'Détails de la tâche', type: Tache })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tachesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une tâche' })
  @ApiResponse({ status: 200, description: 'Tâche mise à jour', type: Tache })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTacheDto: UpdateTacheDto,
  ) {
    return this.tachesService.update(id, updateTacheDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tâche' })
  @ApiResponse({ status: 200, description: 'Tâche supprimée' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tachesService.remove(id);
  }
}
