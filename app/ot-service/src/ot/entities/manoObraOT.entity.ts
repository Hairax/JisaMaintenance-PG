import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('mano_obra_ot')
export class ManoObraOT {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ordenTrabajo_id: number;

  @Column()
  tecnico_id: number;

  @Column('decimal')
  totalHorasTrabajadas: number;

  @Column('decimal')
  costoTotal: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @CreateDateColumn()
  fechaModificacion: Date;
}
