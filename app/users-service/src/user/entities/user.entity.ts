import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

enum UserRole {
  EXTERNO = 'externo',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
  JEFEMANTENIMIENTO = 'jefe-mantenimiento',
  ECARGADOALMACEN = 'encargado-almacen',
  USUARIOCONTABLE = 'usuario-contable',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  cargo: UserRole;
  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  phone: string;

  @Column()
  celphone: string;

  @Column()
  hora$: number;

  @Column()
  minutos$: number;

  @Column()
  userName: string;

  @Column()
  status: boolean;
}
