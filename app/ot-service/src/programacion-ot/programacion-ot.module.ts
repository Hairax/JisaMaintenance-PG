import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ProgramacionOtService } from './programacion-ot.service';
import { ProgramacionOtController } from './programacion-ot.controller';
import { programacionOtProviders } from './db/programacion-ot.provider';
import { DatabaseModule } from '../data/database.module';
import { OtModule } from '../ot/ot.module';

@Module({
  imports: [DatabaseModule, OtModule, ScheduleModule.forRoot()],
  controllers: [ProgramacionOtController],
  providers: [ProgramacionOtService, ...programacionOtProviders],
})
export class ProgramacionOtModule {}
