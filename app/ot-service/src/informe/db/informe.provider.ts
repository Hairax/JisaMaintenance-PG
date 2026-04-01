import { DataSource } from 'typeorm';
import { Informe } from '../entities/informe.entity';
import { InformeDetalle } from '../entities/informe-detalle.entity';

export const informeProviders = [
  {
    provide: 'INFORME_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Informe),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'INFORME_DETALLE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(InformeDetalle),
    inject: ['DATA_SOURCE'],
  },
];
