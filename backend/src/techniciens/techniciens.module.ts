import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechniciensService } from './techniciens.service';
import { TechniciensController } from './techniciens.controller';
import { Technicien } from './entities/technicien.entity';
import { AffectationsModule } from '../affectations/affectations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Technicien]),
    forwardRef(() => AffectationsModule),
  ],
  controllers: [TechniciensController],
  providers: [TechniciensService],
  exports: [TechniciensService, TypeOrmModule],
})
export class TechniciensModule { }
