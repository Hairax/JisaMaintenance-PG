import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { OrdenTrabajo } from '../../ot/entities/ot.entity';
import { User } from '../../ot/entities/user.entity';

@Entity('informe')
export class Informe {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: User;

  //lista de ordenes de trabajo asociadas al informe

  @ManyToOne(() => OrdenTrabajo, { nullable: false })
  @JoinColumn({ name: 'ordenTrabajo_id' })
  ordenTrabajo: OrdenTrabajo;

  @Column({ type: 'text', nullable: true })
  descripcion: string;
  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;
  @Column({ type: 'date', nullable: true })
  fechaFin: Date;
  @Column({ type: 'date', nullable: true })
  createdAt: Date;
  @Column({ type: 'date', nullable: true })
  updatedAt: Date;
}
