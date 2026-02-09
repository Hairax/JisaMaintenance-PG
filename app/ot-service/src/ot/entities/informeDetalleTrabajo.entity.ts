import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('informe_detalle_trabajo')
export class InformeDetalleTrabajo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  informeDiario_id: number;

  @Column()
  ordenTrabajo_id: number;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  @Column({ type: 'text' })
  descripcionLabor: string;

  @Column('decimal')
  horasCalculadas: number;

  @Column('decimal')
  costoCalculado: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @CreateDateColumn()
  fechaModificacion: Date;
}
