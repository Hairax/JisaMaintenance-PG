import { Module } from '@nestjs/common';
import { DatabaseModule } from '../data/database.module';
import { AlmacenService } from './almacen.service';
import { AlmacenController } from './almacen.controller';
import { almacenProviders } from './db/almacen.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [AlmacenController],
  providers: [AlmacenService, ...almacenProviders],
  exports: [AlmacenService],
})
export class AlmacenModule {}
