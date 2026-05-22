import { DataSource } from 'typeorm';
import { UnidadMedida } from '../entities/unidad-medida.entity';

export const unidadMedidaProviders = [
  {
    provide: 'UNIDAD_MEDIDA_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UnidadMedida),
    inject: ['DATA_SOURCE'],
  },
];
