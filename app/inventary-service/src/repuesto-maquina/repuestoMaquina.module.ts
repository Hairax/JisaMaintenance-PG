import { Module } from '@nestjs/common';
import { RepuestoMaquinaController } from './repuestoMaquina.controller';
import { RepuestoMaquinaService } from './repuestoMaquina.service';
import { DatabaseModule } from '../data/database.module';
import { RepuestoMaquina } from './entities/repuesto-maquina.entity';
import { DataSource } from 'typeorm';

export const repuestoMaquinaProviders = [
  {
    provide: 'REPUESTO_MAQUINA_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RepuestoMaquina),
    inject: ['DATA_SOURCE'],
  },
];

@Module({
  imports: [DatabaseModule],
  controllers: [RepuestoMaquinaController],
  providers: [...repuestoMaquinaProviders, RepuestoMaquinaService],
  exports: [RepuestoMaquinaService],
})
export class RepuestoMaquinaModule {}
