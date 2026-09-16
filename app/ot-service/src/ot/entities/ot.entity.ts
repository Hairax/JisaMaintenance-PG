import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Maquina } from './maquina.entity';
import { User } from './user.entity';
import { CostCenter } from './cost-center.entity';
import { Process } from './process.entity';
import { SubUnidad } from './subUnidad.entity';
import { Departamento } from '../../departamento/entities/departamento.entity';
import { Objeto } from '../../objeto/entities/objeto.entity';
import { TipoMantenimiento } from '../../tipoMantenimiento/entities/tipoMantenimiento.entity';

@Entity('orden_trabajo')
export class OrdenTrabajo {
  @PrimaryGeneratedColumn()
  id: number;

  // Explícitamente almacenar los IDs de las relaciones
  @Column({ type: 'int', nullable: true })
  tipoOT_id: number;

  @Column({ type: 'int', nullable: true })
  centroCosto_id: number;

  @Column({ type: 'int', nullable: true })
  proceso_id: number;

  @Column({ type: 'int', nullable: true })
  maquina_id: number;

  @Column({ type: 'int', nullable: true })
  subUnidad_id?: number;

  @Column({ type: 'int', nullable: true })
  departamento_id: number;

  @Column({ type: 'int', nullable: true })
  objeto_id: number;

  @Column({ type: 'int', nullable: true })
  supervisor_id: number;

  // Relaciones ManyToOne
  @ManyToOne(() => TipoMantenimiento)
  @JoinColumn({ name: 'tipoOT_id' })
  tipoOT: TipoMantenimiento;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'centroCosto_id' })
  costCenter: CostCenter;

  @ManyToOne(() => Process)
  @JoinColumn({ name: 'proceso_id' })
  proceso: Process;

  @ManyToOne(() => Maquina)
  @JoinColumn({ name: 'maquina_id' })
  maquina: Maquina;

  @ManyToOne(() => SubUnidad, { nullable: true })
  @JoinColumn({ name: 'subUnidad_id' })
  subUnidad?: SubUnidad;

  @Column({ type: 'varchar', nullable: true })
  tipoEjecucion?: string;

  @ManyToOne(() => Departamento)
  @JoinColumn({ name: 'departamento_id' })
  departamento: Departamento;

  @ManyToOne(() => Objeto)
  @JoinColumn({ name: 'objeto_id' })
  objeto: Objeto;

  @Column({ type: 'decimal', nullable: true })
  tiempoEstimado?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: User; // técnico asignado (user con rol técnico)

  @Column({ type: 'text' })
  descripcionTarea: string;

  @Column({ type: 'text', nullable: true })
  indicacionesEspeciales?: string;

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({ type: 'decimal', default: 1 })
  tipoCambio: number;

  @Column({ default: 'Abierta' })
  estado: string; // Abierta | En Progreso Técnico | En Progreso Almacén | Cerrada

  // Se estampa automáticamente cuando estado pasa a 'Cerrada' (y se limpia
  // si se reabre) — ver OrdenTrabajoService.update. Sirve para poder generar
  // el reporte de cierre de OTs de un mes específico sin depender de
  // fechaCreacion, que es la fecha en que se creó la OT, no en que se cerró.
  @Column({ type: 'datetime', nullable: true })
  fechaCierre?: Date | null;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ type: 'json', nullable: true })
  tecnicos: number[]; // Lista de IDs de técnicos asignados
}
