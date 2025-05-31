import { DataSource } from 'typeorm';
import { TipoMantenimiento } from '../entities/tipoMantenimiento.entity';

export const tipoMantenimientoProviders = [
  {
    provide: 'TIPO_MANTENIMIENTO_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(TipoMantenimiento),
    inject: ['DATA_SOURCE'],
  },
];
