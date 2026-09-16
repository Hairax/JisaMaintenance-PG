import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Compra } from './compra.entity';
import { Repuesto } from '../../repuesto/entities/repuesto.entity';

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

  // FK al repuesto vinculado (nullable para no romper registros existentes)
  @Column({ nullable: true })
  repuestoId: number;

  @ManyToOne(() => Repuesto, { nullable: true })
  @JoinColumn({ name: 'repuestoId' })
  repuesto: Repuesto;

  // Código visible: composite ID (CC.Proc.Maq.Sub.Correlativo)
  @Column({ nullable: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column()
  unidadMedida: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  // Precio sin impuesto: es el que alimenta costoUnitario/costoUnitarioPonderado
  // del repuesto y toda la lógica de costeo. Se calcula a partir de
  // precioOriginal restándole el porcentajeImpuesto.
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  // Precio tal cual figura en la factura/documento del proveedor (con
  // impuesto incluido), tal como lo tipea quien registra la compra. Solo
  // para mostrar en reportes — no participa en el cálculo de costos.
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioOriginal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  importe: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  porcentajeDescuento: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuentoMonto: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  porcentajeImpuesto: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
