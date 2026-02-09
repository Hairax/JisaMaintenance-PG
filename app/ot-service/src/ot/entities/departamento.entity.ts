import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('departamento')
export class Departamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;
}
