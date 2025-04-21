import { DataSource } from 'typeorm';
import { Repuesto } from '../entities/repuesto.entity';

export const repuestoProviders = [
  {
    provide: 'REPUESTO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Repuesto),
    inject: ['DATA_SOURCE'],
  },
];
