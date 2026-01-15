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
import { TechniciensService } from './techniciens.service';
import { CreateTechnicienDto } from './dto/create-technicien.dto';
import { UpdateTechnicienDto } from './dto/update-technicien.dto';
import { Technicien } from './entities/technicien.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Techniciens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/techniciens')
export class TechniciensController {
  constructor(private readonly techniciensService: TechniciensService) { }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau technicien' })
  @ApiResponse({ status: 201, description: 'Technicien créé', type: Technicien })
  create(@Body() createTechnicienDto: CreateTechnicienDto) {
    return this.techniciensService.create(createTechnicienDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les techniciens actifs' })
  @ApiResponse({ status: 200, description: 'Liste des techniciens', type: [Technicien] })
  findAll() {
    return this.techniciensService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un technicien par son ID' })
  @ApiResponse({ status: 200, description: 'Détails du technicien', type: Technicien })
  @ApiResponse({ status: 404, description: 'Technicien non trouvé' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciensService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un technicien' })
  @ApiResponse({ status: 200, description: 'Technicien mis à jour', type: Technicien })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTechnicienDto: UpdateTechnicienDto,
  ) {
    return this.techniciensService.update(id, updateTechnicienDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un technicien' })
  @ApiResponse({ status: 200, description: 'Technicien supprimé' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciensService.remove(id);
  }

  @Get(':id/disponibilite')
  @ApiOperation({ summary: 'Récupérer la disponibilité d\'un technicien' })
  getDisponibilite(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciensService.getDisponibilite(id);
  }

  @Get(':id/affectations')
  @ApiOperation({ summary: 'Récupérer les affectations d\'un technicien' })
  getAffectations(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciensService.getAffectations(id);
  }
}
