import { DataSource } from 'typeorm';
import { Compra } from '../entities/compra.entity';
import { CompraDetalle } from '../entities/compra-detalle.entity';

export const compraProviders = [
  {
    provide: 'COMPRA_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Compra),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'COMPRA_DETALLE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CompraDetalle),
    inject: ['DATA_SOURCE'],
  },
];
