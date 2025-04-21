import { Module } from '@nestjs/common';
import { DatabaseModule } from './data/database.module';
import { CostCenterModule } from './cost-centers/cost-center.module';
import { ProcessModule } from './process/process.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { MaquinaModule } from './maquina/maquina.module';
import { SubUnidadModule } from './subUnidad/subUnidad.module';
import { RepuestoModule } from './repuesto/repuesto.module';
import { RepuestoMaquinaModule } from './repuesto-maquina/repuestoMaquina.module';
@Module({
  imports: [
    DatabaseModule,
    CostCenterModule,
    ProcessModule,
    ProveedorModule,
    MaquinaModule,
    SubUnidadModule,
    RepuestoModule,
    RepuestoMaquinaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
