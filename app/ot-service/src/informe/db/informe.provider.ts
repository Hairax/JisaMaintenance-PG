import { DataSource } from 'typeorm';
import { InformeDiarioTrabajo } from '../entities/informeDiarioTrabajo.entity';
import { InformeDetalleTrabajo } from '../entities/informeDetalleTrabajo.entity';

export const informeProviders = [
  {
    provide: 'DIARIO_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(InformeDiarioTrabajo),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'DETALLE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(InformeDetalleTrabajo),
    inject: ['DATA_SOURCE'],
  },
];
