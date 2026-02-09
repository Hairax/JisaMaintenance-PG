import { Module } from '@nestjs/common';
import { InformeService } from './informe.service';
import { InformeController } from './informe.controller';
import { informeProviders } from './db/informe.provider';
import { DatabaseModule } from 'src/data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InformeController],
  providers: [InformeService, ...informeProviders],
})
export class InformeModule {}
