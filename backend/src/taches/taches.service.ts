import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tache, StatutTache, PrioriteTache } from './entities/tache.entity';
import { CreateTacheDto } from './dto/create-tache.dto';
import { UpdateTacheDto } from './dto/update-tache.dto';

@Injectable()
export class TachesService {
  constructor(
    @InjectRepository(Tache)
    private readonly tacheRepository: Repository<Tache>,
  ) { }

  async create(createTacheDto: CreateTacheDto): Promise<Tache> {
    const tacheData: Partial<Tache> = {
      titre: createTacheDto.titre,
      description: createTacheDto.description,
      competencesRequises: createTacheDto.competencesRequises,
      localisation: createTacheDto.localisation,
      dureeEstimee: createTacheDto.dureeEstimee,
      priorite: createTacheDto.priorite,
    };
    if (createTacheDto.debutPlanifie) {
      tacheData.debutPlanifie = new Date(createTacheDto.debutPlanifie);
    }
    const tache = this.tacheRepository.create(tacheData);
    return await this.tacheRepository.save(tache) as Tache;
  }

  async findAll(): Promise<Tache[]> {
    return this.tacheRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tache> {
    const tache = await this.tacheRepository.findOne({
      where: { id },
      relations: ['affectation'],
    });
    if (!tache) {
      throw new NotFoundException(`Tâche avec l'ID ${id} non trouvée`);
    }
    return tache;
  }

  async update(id: string, updateTacheDto: UpdateTacheDto): Promise<Tache> {
    const tache = await this.findOne(id);
    if (updateTacheDto.titre) tache.titre = updateTacheDto.titre;
    if (updateTacheDto.description) tache.description = updateTacheDto.description;
    if (updateTacheDto.competencesRequises) tache.competencesRequises = updateTacheDto.competencesRequises;
    if (updateTacheDto.localisation) tache.localisation = updateTacheDto.localisation;
    if (updateTacheDto.dureeEstimee) tache.dureeEstimee = updateTacheDto.dureeEstimee;
    if (updateTacheDto.priorite) tache.priorite = updateTacheDto.priorite;
    if (updateTacheDto.statut) tache.statut = updateTacheDto.statut;
    if (updateTacheDto.debutPlanifie) tache.debutPlanifie = new Date(updateTacheDto.debutPlanifie);
    return await this.tacheRepository.save(tache) as Tache;
  }

  async remove(id: string): Promise<void> {
    const tache = await this.findOne(id);
    await this.tacheRepository.remove(tache);
  }

  async findEnAttente(): Promise<Tache[]> {
    return this.tacheRepository.find({
      where: { statut: StatutTache.EN_ATTENTE },
      order: { priorite: 'DESC', createdAt: 'ASC' },
    });
  }

  async findUrgentesNonAssignees(): Promise<Tache[]> {
    return this.tacheRepository.find({
      where: {
        priorite: PrioriteTache.URGENTE,
        statut: StatutTache.EN_ATTENTE,
      },
      order: { createdAt: 'ASC' },
    });
  }
}
