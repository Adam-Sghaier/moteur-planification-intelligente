import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affectation } from './entities/affectation.entity';
import { TechniciensModule } from '../techniciens/techniciens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Affectation]),
    forwardRef(() => TechniciensModule),
  ],
  exports: [TypeOrmModule],
})
export class AffectationsModule { }
