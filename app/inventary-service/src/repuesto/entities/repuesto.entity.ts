import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Repuesto {
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
}
