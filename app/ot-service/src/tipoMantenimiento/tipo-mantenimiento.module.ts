import { Module } from '@nestjs/common';
import { TipoMantenimientoController } from './tipo-mantenimiento.controller';
import { TipoMantenimientoService } from './tipo-mantenimiento.service';
import { tipoMantenimientoProviders } from './db/tipoMantenimiento.provider';

@Module({
  controllers: [TipoMantenimientoController],
  providers: [TipoMantenimientoService, ...tipoMantenimientoProviders],
  exports: [TipoMantenimientoService],
})
export class TipoMantenimientoModule {}
