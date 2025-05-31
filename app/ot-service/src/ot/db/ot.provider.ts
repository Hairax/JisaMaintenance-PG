import { DataSource } from 'typeorm';
import { OrdenTrabajo } from '../entities/ot.entity';

export const otProviders = [
  {
    provide: 'OT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(OrdenTrabajo),
    inject: ['DATA_SOURCE'],
  },
];
