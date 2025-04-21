import { Module } from '@nestjs/common';
import { SubUnidadController } from './subUnidad.controller';
import { SubUnidadService } from './subUnidad.service';
import { subUnidadProviders } from './db/subUnidad.providers';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SubUnidadController],
  providers: [...subUnidadProviders, SubUnidadService],
})
export class SubUnidadModule {}
