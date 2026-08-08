import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Frecuencia con la que se debe generar automáticamente una OT a partir de
// esta plantilla. Pensado sobre todo para mantenimiento preventivo
// periódico (ej. "cada 30 días" para un ventilador y su sub unidad).
export type FrecuenciaUnidad = 'dias' | 'semanas' | 'meses';

@Entity('programacion_ot')
export class ProgramacionOt {
  @PrimaryGeneratedColumn()
  id: number;

  // Referencias a datos del inventary-service (no hay FK real entre
  // microservicios, se guarda solo el id, igual que en OrdenTrabajo).
  @Column({ type: 'int' })
  maquina_id: number;

  @Column({ type: 'int', nullable: true })
  subUnidad_id?: number;

  @Column({ type: 'int' })
  centroCosto_id: number;

  @Column({ type: 'int' })
  proceso_id: number;

  // Referencias a datos propios del ot-service.
  @Column({ type: 'int' })
  tipoOT_id: number;

  @Column({ type: 'int' })
  departamento_id: number;

  @Column({ type: 'int' })
  objeto_id: number;

  @Column({ type: 'int' })
  supervisor_id: number;

  @Column({ default: 'Preventivo' })
  tipoEjecucion: string;

  @Column({ type: 'text' })
  descripcionTarea: string;

  @Column({ type: 'text', nullable: true })
  indicacionesEspeciales?: string;

  @Column({ type: 'decimal', nullable: true })
  tiempoEstimado?: number;

  @Column({ type: 'int' })
  frecuenciaValor: number;

  @Column({ type: 'varchar' })
  frecuenciaUnidad: FrecuenciaUnidad;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  proximaEjecucion: string;

  @Column({ type: 'datetime', nullable: true })
  ultimaEjecucion?: Date | null;

  @Column({ type: 'int', nullable: true })
  ultimaOtGeneradaId?: number | null;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'text', nullable: true })
  nombre?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
