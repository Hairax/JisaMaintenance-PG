import { DataSource } from 'typeorm';
import { Maquina } from '../entities/maquina.entity';

export const maquinaProviders = [
  {
    provide: 'MAQUINA_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Maquina),
    inject: ['DATA_SOURCE'],
  },
];
