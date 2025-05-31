import { Module } from '@nestjs/common';
import { DepartamentoController } from './departamento.controller';
import { DepartamentoService } from './departamento.service';
import { departamentoProviders } from './db/departamento.provider';

@Module({
  controllers: [DepartamentoController],
  providers: [DepartamentoService, ...departamentoProviders],
  exports: [DepartamentoService],
})
export class DepartamentoModule {}
