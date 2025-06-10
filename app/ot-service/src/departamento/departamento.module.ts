import { Module } from '@nestjs/common';
import { DepartamentoController } from './departamento.controller';
import { DepartamentoService } from './departamento.service';
import { departamentoProviders } from './db/departamento.provider';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DepartamentoController],
  providers: [DepartamentoService, ...departamentoProviders],
})
export class DepartamentoModule {}
