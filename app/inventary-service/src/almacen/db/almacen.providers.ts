import { DataSource } from 'typeorm';
import { Almacen } from '../entities/almacen.entity';

export const almacenProviders = [
  {
    provide: 'ALMACEN_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Almacen),
    inject: ['DATA_SOURCE'],
  },
];
