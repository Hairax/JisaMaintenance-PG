import { Module } from '@nestjs/common';
import { CompraController } from './compra.controller';
import { CompraService } from './compra.service';
import { compraProviders } from './db/compra.providers';
import { repuestoProviders } from '../repuesto/db/repuesto.providers';
import { DatabaseModule } from '../data/database.module';
import { RepuestoModule } from '../repuesto/repuesto.module';

@Module({
  imports: [DatabaseModule, RepuestoModule],
  controllers: [CompraController],
  providers: [...compraProviders, ...repuestoProviders, CompraService],
  exports: [CompraService],
})
export class CompraModule {}
