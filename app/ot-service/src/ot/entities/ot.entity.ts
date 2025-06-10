// src/orden-trabajo/entities/orden-trabajo.entity.ts
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

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({ type: 'decimal' })
  tipoCambio: number;

  @Column({ default: 'Abierta' })
  estado: string; // Abierta | En Progreso Técnico | En Progreso Almacén | Cerrada

  @CreateDateColumn()
  fechaCreacion: Date;
}
