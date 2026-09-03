import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Maquina } from './maquina.entity';

// Copia liviana de la entidad de inventary-service (ver nota en
// process.entity.ts de este mismo servicio).
@Entity()
@Unique(['maquina', 'correlativo'])
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
