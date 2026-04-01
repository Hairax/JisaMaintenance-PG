import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SalidaDetalle } from './salida-detalle.entity';

@Entity('salida')
export class Salida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nroSalida: string;

  @Column()
  usuarioId: number;

  @Column()
  otId: number;

  @Column({ type: 'datetime' })
  fecha: Date;

  @Column({ nullable: true })
  observacion: string;

  @Column({ nullable: true })
  almacen: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuentoTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'completada', 'cancelada'],
    default: 'pendiente',
  })
  estado: 'pendiente' | 'completada' | 'cancelada';

  @OneToMany(() => SalidaDetalle, (detalle) => detalle.salida, {
    cascade: true,
    eager: true,
  })
  detalles: SalidaDetalle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
