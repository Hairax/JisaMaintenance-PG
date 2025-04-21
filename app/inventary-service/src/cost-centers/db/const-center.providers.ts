import { DataSource } from 'typeorm';
import { CostCenter } from '../entities/cost-center.entity';

export const costCenterProviders = [
  {
    provide: 'COST_CENTER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CostCenter),
    inject: ['DATA_SOURCE'],
  },
];
