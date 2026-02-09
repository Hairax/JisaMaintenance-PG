import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('informe_diario_trabajo')
export class InformeDiarioTrabajo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tecnico_id: number;

  @Column({ type: 'date' })
  fechaTrabajo: Date;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @CreateDateColumn()
  fechaModificacion: Date;
}
