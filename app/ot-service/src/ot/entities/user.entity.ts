import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

const decimalANumero = {
  to: (v?: number | null) => v,
  from: (v?: string | null) => (v === null || v === undefined ? v : Number(v)),
};

enum UserRole {
  EXTERNO = 'externo',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
  JEFEMANTENIMIENTO = 'jefe-mantenimiento',
  ECARGADOALMACEN = 'encargado-almacen',
  USUARIOCONTABLE = 'usuario-contable',
  ENCARGADOCOMPRAS = 'encargado-compras',
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

  // DECIMAL para aceptar tarifas con decimales. MySQL devuelve DECIMAL como
  // string: el transformer lo entrega como number. Debe ser idéntica en
  // auth-service, users-service y ot-service (misma tabla `user`).
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 6,
    default: 0,
    transformer: decimalANumero,
  })
  hora$: number;

  // DECIMAL para aceptar tarifas con decimales. MySQL devuelve DECIMAL como
  // string: el transformer lo entrega como number. Debe ser idéntica en
  // auth-service, users-service y ot-service (misma tabla `user`).
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 6,
    default: 0,
    transformer: decimalANumero,
  })
  minutos$: number;

  @Column()
  userName: string;

  @Column()
  status: boolean;
}
