import { Module } from '@nestjs/common';
import { DatabaseModule } from '../data/database.module';
import { UnidadesMedidaService } from './unidades-medida.service';
import { UnidadesMedidaController } from './unidades-medida.controller';
import { unidadMedidaProviders } from './db/unidad-medida.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [UnidadesMedidaController],
  providers: [UnidadesMedidaService, ...unidadMedidaProviders],
  exports: [UnidadesMedidaService],
})
export class UnidadesMedidaModule {}
