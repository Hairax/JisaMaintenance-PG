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

  @Column({ type: 'enum', enum: ['NORMAL', 'LIBRE'], default: 'NORMAL' })
  tipo: string;

  @Column({ nullable: true })
  codigoPersonalizado: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  uMedida: string;

  @Column({ nullable: true })
  almacen: string;

  @Column({ nullable: true })
  numeroDeParte: string;

  @Column({ nullable: true })
  ubicacion: string;

  @Column({ type: 'text', nullable: true })
  especificacion: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  costoUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  costoUnitarioPonderado: number;

  // Apertura: initial stock and price when the repuesto was created (not from compras)
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  aperturaCantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  aperturaCostoUnitario: number;

  @Column({ default: 0 })
  cantidad: number;

  @Column({ nullable: true })
  stockCritico: number;

  // Uso interno: marca si el repuesto le interesa a contabilidad (filtra los
  // exports contables de compras/salidas). No se muestra en otros reportes.
  @Column({ default: true })
  contable: boolean;

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
