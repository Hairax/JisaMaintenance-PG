import { Module } from '@nestjs/common';
import { MaquinaController } from './maquina.controller';
import { MaquinaService } from './maquina.service';
import { maquinaProviders } from './db/maquina.providers';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MaquinaController],
  providers: [...maquinaProviders, MaquinaService],
})
export class MaquinaModule {}
