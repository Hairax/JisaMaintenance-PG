import { DataSource } from 'typeorm';
import { Objeto } from '../entities/objeto.entity';

export const objetoProviders = [
  {
    provide: 'OBJETO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Objeto),
    inject: ['DATA_SOURCE'],
  },
];
