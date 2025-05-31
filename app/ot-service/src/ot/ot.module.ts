import { Module } from '@nestjs/common';
import { OrdenTrabajoService } from './ot.service';
import { OtController } from './ot.controller';
import { otProviders } from './db/ot.provider';

@Module({
  controllers: [OtController],
  providers: [OrdenTrabajoService, ...otProviders],
  exports: [OrdenTrabajoService],
})
export class OtModule {}
