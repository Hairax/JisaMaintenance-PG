import { Module } from '@nestjs/common';
import { CostCenterController } from './cost-center.controller';
import { CostCenterService } from './cost-center.service';
import { costCenterProviders } from './db/const-center.providers';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CostCenterController],
  providers: [...costCenterProviders, CostCenterService],
  exports: [CostCenterService],
})
export class CostCenterModule {
  constructor() {
    console.log('costCenterProviders:', costCenterProviders);
  }
}
