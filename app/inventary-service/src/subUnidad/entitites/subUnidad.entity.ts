import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Maquina } from '../../maquina/entities/maquina.entity';

@Entity()
export class SubUnidad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Maquina)
  @JoinColumn({ name: 'maquina_id' })
  maquina: Maquina;

  @Column({ nullable: true, type: 'int' })
  correlativo?: number;

  @Column()
  descripcion: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
