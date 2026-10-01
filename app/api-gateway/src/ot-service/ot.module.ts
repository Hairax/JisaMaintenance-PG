import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { serviceHost } from '../common/service-host';
import { TipoMantenimientoHttpController } from './tipoMantenimiento/tipo-mantenimiento.controller';
import { ObjetoHttpController } from './objeto/objeto.controller';
import { DepartamentoHttpController } from './departamento/departamento.controller';
import { OtHttpController } from './ot/ot.controller';
import { InformeHttpController } from './informe/informe.controller';
import { ProgramacionOtHttpController } from './programacion-ot/programacion-ot.controller';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'OT_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          host: serviceHost(process.env.OT_SERVICE_HOST),
          port: parseInt(process.env.OT_SERVICE_PORT || '3004'),
        },
      },
    ]),
  ],
  controllers: [
    TipoMantenimientoHttpController,
    ObjetoHttpController,
    DepartamentoHttpController,
    OtHttpController,
    InformeHttpController,
    ProgramacionOtHttpController,
  ],
  providers: [],
})
export class OtModule {}
