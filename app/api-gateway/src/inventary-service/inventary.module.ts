import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CostCenterHttpController } from './cost-center/cost-center.controller';
import { ProcessHttpController } from './process/process.controller';
import { ProveedorHttpController } from './proveedor/proveedor.controller';
import { MaquinaHttpController } from './maquina/maquina.controller';
import { SubUnidadHttpController } from './subUnidad/subUnidad.controller';
import { RepuestoHttpController } from './repuesto/repuesto.controller';
import { RespuestoMaquinaHttpController } from './repuesto-maquina/respuestoMaquina.controller';
import { CompraHttpController } from './compra/compra.controller';
import { SalidaHttpController } from './salida/salida.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INVENTORY_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3003,
        },
      },
    ]),
  ],
  controllers: [
    CostCenterHttpController,
    ProcessHttpController,
    ProveedorHttpController,
    MaquinaHttpController,
    SubUnidadHttpController,
    RepuestoHttpController,
    RespuestoMaquinaHttpController,
    CompraHttpController,
    SalidaHttpController,
  ],
})
export class InventaryModule {}
