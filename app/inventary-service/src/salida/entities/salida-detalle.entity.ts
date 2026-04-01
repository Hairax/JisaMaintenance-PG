import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Salida } from './salida.entity';

@Entity('salida_detalle')
export class SalidaDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  salidaId: number;

  @Column({ type: 'enum', enum: ['repuesto', 'repuesto-maquina'] })
  tipoProducto: 'repuesto' | 'repuesto-maquina';

  @Column({ nullable: true })
  productoId: number;

  @Column()
  codigo: string;

  @Column()
  nombre: string;

  @Column()
  unidadMedida: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importe: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  porcentajeDescuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuentoMonto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Salida, (salida) => salida.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'salidaId' })
  salida: Salida;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
