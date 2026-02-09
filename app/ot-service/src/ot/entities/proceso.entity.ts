import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CostCenter } from './cost-center.entity';

@Entity('proceso')
export class Proceso {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'centroCosto_id' })
  centroCosto: CostCenter;

  @Column()
  descripcion: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @CreateDateColumn()
  fechaModificacion: Date;
}
