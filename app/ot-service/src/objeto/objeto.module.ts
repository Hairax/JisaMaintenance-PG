import { Module } from '@nestjs/common';
import { ObjetoController } from './objeto.controller';
import { ObjetoService } from './objeto.service';
import { objetoProviders } from './db/objeto.provider';
import { DatabaseModule } from 'src/data/database.module';

@Module({
  controllers: [ObjetoController],
  providers: [ObjetoService, ...objetoProviders],
  imports: [DatabaseModule],
})
export class ObjetoModule {}
