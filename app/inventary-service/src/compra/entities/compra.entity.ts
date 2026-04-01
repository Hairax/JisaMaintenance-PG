import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';
import { CompraDetalle } from './compra-detalle.entity';

@Entity()
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nroDocumento: string;

  @Column({ type: 'enum', enum: ['Factura', 'Documento'], default: 'Factura' })
  tipoDocumento: string;

  @Column()
  nroFactura: string;

  @Column()
  nit: string;

  @Column()
  proveedorId: number;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedor;

  @Column()
  detalle: string;

  @Column()
  almacen: string;

  @Column({ type: 'datetime' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tipoCambio: number;

  @Column({ nullable: true })
  nroAutorizacion: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuentoTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @OneToMany(() => CompraDetalle, (detalle) => detalle.compra, {
    cascade: true,
    eager: true,
  })
  detalles: CompraDetalle[];

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
