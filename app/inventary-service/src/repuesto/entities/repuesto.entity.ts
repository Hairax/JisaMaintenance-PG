import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CostCenter } from '../../cost-centers/entities/cost-center.entity';
import { Process } from '../../process/entities/process.entity';
import { Maquina } from '../../maquina/entities/maquina.entity';
import { SubUnidad } from '../../subUnidad/entitites/subUnidad.entity';

@Entity()
export class Repuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: ['PZA', 'KG', 'LT', 'MT', 'GL', 'UN', 'JGO'],
    default: 'PZA',
    nullable: true,
  })
  uMedida: string;

  @Column({ nullable: true })
  numeroDeParte: string;

  @Column({ nullable: true })
  ubicacion: string;

  @Column({ type: 'text', nullable: true })
  especificacion: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  costoUnitario: number;

  @Column({ default: 0 })
  cantidad: number;

  @Column({ nullable: true })
  stockCritico: number;

  @Column({ nullable: true })
  correlativo: number;

  @ManyToOne(() => CostCenter, { nullable: true })
  @JoinColumn({ name: 'centroCosto_id' })
  costCenter: CostCenter;

  @ManyToOne(() => Process, { nullable: true })
  @JoinColumn({ name: 'proceso_id' })
  process: Process;

  @ManyToOne(() => Maquina, { nullable: true })
  @JoinColumn({ name: 'maquina_id' })
  maquina: Maquina;

  @ManyToOne(() => SubUnidad, { nullable: true })
  @JoinColumn({ name: 'subUnidad_id' })
  subUnidad: SubUnidad;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
