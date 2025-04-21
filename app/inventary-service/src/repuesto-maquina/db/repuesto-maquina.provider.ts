import { DataSource } from 'typeorm';
import { RepuestoMaquina } from '../entities/repuesto-maquina.entity';

export const repuestoMaquinaProviders = [
  {
    provide: 'REPUESTO_MAQUINA_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RepuestoMaquina),
    inject: ['DATA_SOURCE'],
  },
];
