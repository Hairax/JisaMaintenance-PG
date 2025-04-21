import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Maquina } from '../../maquina/entities/maquina.entity';
import { SubUnidad } from '../../subUnidad/entitites/subUnidad.entity';
@Entity()
export class RepuestoMaquina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  cantidad: number;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @Column()
  costoUnitario: number;
  @Column()
  descripcion: string;

  @ManyToOne(() => Maquina)
  @JoinColumn({ name: 'maquina_id' })
  maquina: Maquina;

  @ManyToOne(() => SubUnidad, { nullable: true })
  @JoinColumn({ name: 'sub_unidad_id' })
  subUnidad: SubUnidad | null;
}
