import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TipoMantenimientoHttpController } from './tipoMantenimiento/tipo-mantenimiento.controller';
import { ObjetoHttpController } from './objeto/objeto.controller';
import { DepartamentoHttpController } from './departamento/departamento.controller';
import { OtHttpController } from './ot/ot.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'OT_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3004,
        },
      },
    ]),
  ],
  controllers: [
    TipoMantenimientoHttpController,
    ObjetoHttpController,
    DepartamentoHttpController,
    OtHttpController,
  ],
  providers: [],
})
export class OtModule {}
