import { Module } from '@nestjs/common';
import { OrdenTrabajoService } from './ot.service';
import { OtController } from './ot.controller';
import { otProviders } from './db/ot.provider';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OtController],
  providers: [OrdenTrabajoService, ...otProviders],
})
export class OtModule {}
