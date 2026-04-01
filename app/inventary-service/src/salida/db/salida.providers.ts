import { DataSource } from 'typeorm';
import { Salida } from '../entities/salida.entity';
import { SalidaDetalle } from '../entities/salida-detalle.entity';

export const salidaProviders = [
  {
    provide: 'SALIDA_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Salida),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SALIDA_DETALLE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SalidaDetalle),
    inject: ['DATA_SOURCE'],
  },
];
