import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TachesService } from './taches.service';
import { TachesController } from './taches.controller';
import { Tache } from './entities/tache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tache])],
  controllers: [TachesController],
  providers: [TachesService],
  exports: [TachesService, TypeOrmModule],
})
export class TachesModule { }
