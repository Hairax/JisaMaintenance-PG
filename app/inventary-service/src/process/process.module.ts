import { Module } from '@nestjs/common';
import { ProcessController } from './process.controller';
import { ProcessService } from './process.service';
import { processProviders } from './db/process.providers';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProcessController],
  providers: [...processProviders, ProcessService],
})
export class ProcessModule {
  constructor() {
    console.log('processProviders:', processProviders);
  }
}
