import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('detalle_costo_ot')
export class DetalleCostoOT {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ordenTrabajo_id: number;

  @Column('decimal')
  tiempoRealHoras: number;

  @Column('decimal')
  tiempoEstimadoHoras: number;

  @Column('decimal')
  costoManoObra: number;

  @Column('decimal')
  costoMateriales: number;

  @Column('decimal')
  costoTotal: number;

  @Column({ type: 'datetime', nullable: true })
  fechaCierre?: Date;

  @CreateDateColumn()
  fechaCreacion: Date;

  @CreateDateColumn()
  fechaModificacion: Date;
}
