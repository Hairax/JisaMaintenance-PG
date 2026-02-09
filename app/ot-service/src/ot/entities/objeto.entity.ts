import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('objeto')
export class Objeto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;
}
