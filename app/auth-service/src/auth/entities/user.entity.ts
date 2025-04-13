import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../enum/userRol.enum';

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
