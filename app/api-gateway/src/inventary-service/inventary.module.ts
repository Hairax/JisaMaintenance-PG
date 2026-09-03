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
import { UnidadesMedidaHttpController } from './unidades-medida/unidades-medida.controller';
import { AlmacenesHttpController } from './almacen/almacen.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INVENTORY_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.INVENTORY_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.INVENTORY_SERVICE_PORT || '3003'),
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
    UnidadesMedidaHttpController,
    AlmacenesHttpController,
  ],
})
export class InventaryModule {}
