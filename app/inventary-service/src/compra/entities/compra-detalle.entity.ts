import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Compra } from './compra.entity';

@Entity()
export class CompraDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  compraId: number;

  @ManyToOne(() => Compra, (compra) => compra.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'compraId' })
  compra: Compra;

  // Tipo de producto: 'repuesto' o 'repuesto-maquina'
  @Column({ type: 'enum', enum: ['repuesto', 'repuesto-maquina'] })
  tipoProducto: string;

  // ID del producto (opcional, para referencia)
  @Column({ nullable: true })
  productoId: number;

  // Datos del producto
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

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  importe: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  porcentajeDescuento: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuentoMonto: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
