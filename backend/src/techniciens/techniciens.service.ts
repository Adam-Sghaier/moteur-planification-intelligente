import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technicien } from './entities/technicien.entity';
import { CreateTechnicienDto } from './dto/create-technicien.dto';
import { UpdateTechnicienDto } from './dto/update-technicien.dto';
import { Affectation, StatutAffectation } from '../affectations/entities/affectation.entity';
import { IDisponibiliteTechnicien } from './interfaces/technicien.interface';

@Injectable()
export class TechniciensService {
  constructor(
    @InjectRepository(Technicien)
    private readonly technicienRepository: Repository<Technicien>,
    @InjectRepository(Affectation)
    private readonly affectationRepository: Repository<Affectation>,
  ) { }

  async create(createTechnicienDto: CreateTechnicienDto): Promise<Technicien> {
    const existant = await this.technicienRepository.findOne({
      where: { email: createTechnicienDto.email },
    });
    if (existant) {
      throw new ConflictException('Un technicien avec cet email existe déjà');
    }
    const technicien = this.technicienRepository.create(createTechnicienDto);
    return this.technicienRepository.save(technicien);
  }

  async findAll(): Promise<Technicien[]> {
    return this.technicienRepository.find({ where: { estActif: true } });
  }

  async findOne(id: string): Promise<Technicien> {
    const technicien = await this.technicienRepository.findOne({
      where: { id },
      relations: ['affectations'],
    });
    if (!technicien) {
      throw new NotFoundException(`Technicien avec l'ID ${id} non trouvé`);
    }
    return technicien;
  }

  async update(id: string, updateTechnicienDto: UpdateTechnicienDto): Promise<Technicien> {
    const technicien = await this.findOne(id);
    Object.assign(technicien, updateTechnicienDto);
    return this.technicienRepository.save(technicien);
  }

  async remove(id: string): Promise<void> {
    const technicien = await this.findOne(id);
    await this.technicienRepository.remove(technicien);
  }

  async getDisponibilite(id: string): Promise<IDisponibiliteTechnicien> {
    const technicien = await this.findOne(id);
    const debutSemaine = this.getDebutSemaine(new Date());
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(finSemaine.getDate() + 7);

    const affectations = await this.affectationRepository.find({
      where: {
        technicienId: id,
        statut: StatutAffectation.PLANIFIEE,
      },
    });

    const minutesUtilisees = affectations
      .filter(a => a.heureDebut >= debutSemaine && a.heureDebut < finSemaine)
      .reduce((total, a) => {
        const duree = (a.heureFin.getTime() - a.heureDebut.getTime()) / (1000 * 60);
        return total + duree;
      }, 0);

    const heuresUtilisees = minutesUtilisees / 60;
    const heuresRestantes = technicien.limiteHeuresHebdo - heuresUtilisees;

    return {
      technicienId: id,
      creneauxDisponibles: [],
      heuresUtiliseesSemaine: heuresUtilisees,
      heuresRestantesSemaine: Math.max(0, heuresRestantes),
    };
  }

  async getAffectations(id: string): Promise<Affectation[]> {
    await this.findOne(id);
    return this.affectationRepository.find({
      where: { technicienId: id },
      relations: ['tache'],
      order: { heureDebut: 'ASC' },
    });
  }

  private getDebutSemaine(date: Date): Date {
    const d = new Date(date);
    const jour = d.getDay();
    const diff = d.getDate() - jour + (jour === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
