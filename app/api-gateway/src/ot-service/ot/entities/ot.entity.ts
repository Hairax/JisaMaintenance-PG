import { TipoMantenimientoDto } from '../../tipoMantenimiento/entities/tipoMantenimiento.entity';
import { CostCenter } from '../../../inventary-service/cost-center/entities/cost-center.entity';
import { Process } from '../../../inventary-service/process/entities/cost-center.entity';
import { Maquina } from '../../../inventary-service/maquina/entities/maquina.entity';
import { SubUnidad } from '../../../inventary-service/subUnidad/entitites/subUnidad.entity';
import { Departamento } from '../../departamento/entities/departamento.entity';
import { Obeto } from '../../objeto/entities/objeto.entity';
import { UserDto } from './user.entity';

export class OrdenTrabajoResponse {
  id: number;
  tipoOT: TipoMantenimientoDto;
  centroCosto: CostCenter;
  proceso: Process;
  maquina: Maquina;
  subUnidad?: SubUnidad;
  tipoEjecucion: string;
  departamento: Departamento;
  objeto: Obeto;
  tiempoEstimado?: number;
  supervisor: UserDto;
  descripcionTarea: string;
  fechaHora: Date;
  tipoCambio: number;
  estado: string; // Abierta | En Progreso Técnico | En Progreso Almacén | Cerrada
  fechaCreacion: Date;
  tecnicos: number[];
}
