import { Module } from '@nestjs/common';
import { DatabaseModule } from './data/database.module';
import { TipoMantenimientoModule } from './tipoMantenimiento/tipo-mantenimiento.module';
import { DepartamentoModule } from './departamento/departamento.module';
import { ObjetoModule } from './objeto/objeto.module';
import { OtModule } from './ot/ot.module';
@Module({
  imports: [
    DatabaseModule,
    TipoMantenimientoModule,
    DepartamentoModule,
    ObjetoModule,
    OtModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
