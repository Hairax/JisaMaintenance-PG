import { Module } from '@nestjs/common';
import { ProveedorController } from './proveedor.controller';
import { ProveedorService } from './proveedor.service';
import { proveedorProviders } from './db/proveedor.providers';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProveedorController],
  providers: [...proveedorProviders, ProveedorService],
})
export class ProveedorModule {}
