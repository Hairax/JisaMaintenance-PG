import { Module } from '@nestjs/common';
import { DatabaseModule } from './data/database.module';
import { TipoMantenimientoModule } from './tipoMantenimiento/tipo-mantenimiento.module';
import { ObjetoModule } from './objeto/objeto.module';
import { DepartamentoModule } from './departamento/departamento.module';

@Module({
  imports: [
    DatabaseModule,
    TipoMantenimientoModule,
    ObjetoModule,
    DepartamentoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
