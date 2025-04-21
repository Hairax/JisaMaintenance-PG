import { DataSource } from 'typeorm';
import { Process } from '../entities/process.entity';

export const processProviders = [
  {
    provide: 'PROCESS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Process),
    inject: ['DATA_SOURCE'],
  },
];
