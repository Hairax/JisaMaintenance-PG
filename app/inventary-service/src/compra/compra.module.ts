import { Module } from '@nestjs/common';
import { CompraController } from './compra.controller';
import { CompraService } from './compra.service';
import { compraProviders } from './db/compra.providers';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CompraController],
  providers: [...compraProviders, CompraService],
  exports: [CompraService],
})
export class CompraModule {
  constructor() {
    console.log('compraProviders:', compraProviders);
  }
}
