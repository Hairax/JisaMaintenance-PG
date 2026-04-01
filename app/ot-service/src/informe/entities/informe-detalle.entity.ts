import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Informe } from './informe.entity';

@Entity('informe_detalle')
export class InformeDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  informeId: number;

  @ManyToOne(() => Informe, (informe) => informe.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'informeId' })
  informe: Informe;

  @Column()
  otId: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFinalización: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
