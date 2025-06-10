import { Module } from '@nestjs/common';
import { TipoMantenimientoController } from './tipo-mantenimiento.controller';
import { TipoMantenimientoService } from './tipo-mantenimiento.service';
import { tipoMantenimientoProviders } from './db/tipoMantenimiento.provider';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TipoMantenimientoController],
  providers: [TipoMantenimientoService, ...tipoMantenimientoProviders],
})
export class TipoMantenimientoModule {}
