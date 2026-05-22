import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CostCenter } from '../../cost-centers/entities/cost-center.entity';

@Entity()
export class Process {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'centroCosto_id' })
  costCenter: CostCenter;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'int' })
  correlativo?: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
