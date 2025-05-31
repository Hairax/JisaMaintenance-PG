import { Module } from '@nestjs/common';
import { ObjetoController } from './objeto.controller';
import { ObjetoService } from './objeto.service';
import { objetoProviders } from './db/objeto.provider';

@Module({
  controllers: [ObjetoController],
  providers: [ObjetoService, ...objetoProviders],
  exports: [ObjetoService],
})
export class ObjetoModule {}
