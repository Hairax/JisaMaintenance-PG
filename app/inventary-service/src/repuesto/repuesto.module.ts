import { Module } from '@nestjs/common';
import { RepuestoController } from './repuesto.controller';
import { RepuestoService } from './repuesto.service';
import { repuestoProviders } from './db/repuesto.providers';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RepuestoController],
  providers: [...repuestoProviders, RepuestoService],
})
export class RepuestoModule {}
