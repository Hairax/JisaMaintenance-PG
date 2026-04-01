import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InformeDetalle } from './informe-detalle.entity';

@Entity('informe')
export class Informe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @OneToMany(() => InformeDetalle, (detalle) => detalle.informe, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  detalles: InformeDetalle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
