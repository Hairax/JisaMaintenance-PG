import { Module } from '@nestjs/common';
import { DatabaseModule } from '../data/database.module';
import { SalidaService } from './salida.service';
import { SalidaController } from './salida.controller';
import { salidaProviders } from './db/salida.providers';
import { repuestoProviders } from '../repuesto/db/repuesto.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [SalidaController],
  providers: [SalidaService, ...salidaProviders, ...repuestoProviders],
})
export class SalidaModule {}
