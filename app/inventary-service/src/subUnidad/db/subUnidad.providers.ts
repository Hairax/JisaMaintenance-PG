import { DataSource } from 'typeorm';
import { SubUnidad } from '../entitites/subUnidad.entity';

export const subUnidadProviders = [
  {
    provide: 'SUBUNIDAD_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SubUnidad),
    inject: ['DATA_SOURCE'],
  },
];
