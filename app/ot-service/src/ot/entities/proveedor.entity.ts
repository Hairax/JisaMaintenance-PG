import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Proveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  telefono: string;

  @Column()
  ruc: string;

  @Column()
  correoElectronico: string;

  @Column()
  direccion: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
