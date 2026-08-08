import { DataSource } from 'typeorm';
import { ProgramacionOt } from '../entities/programacion-ot.entity';

export const programacionOtProviders = [
  {
    provide: 'PROGRAMACION_OT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProgramacionOt),
    inject: ['DATA_SOURCE'],
  },
];
