import { DataSource } from 'typeorm';
import { Repuesto } from '../entities/repuesto.entity';
import { CompraDetalle } from '../../compra/entities/compra-detalle.entity';
import { SalidaDetalle } from '../../salida/entities/salida-detalle.entity';

export const repuestoProviders = [
  {
    provide: 'REPUESTO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Repuesto),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'COMPRA_DETALLE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CompraDetalle),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SALIDA_DETALLE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SalidaDetalle),
    inject: ['DATA_SOURCE'],
  },
];
