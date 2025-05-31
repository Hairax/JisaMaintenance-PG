import { UserRole } from './enum/userRol.enum';
export class UserDto {
  id: number;
  name: string;
  lastName: string;
  email: string;
  password: string;
  cargo: UserRole;
  createdAt: Date;
  updatedAt: Date;
  phone: string;
  celphone: string;
  hora$: number;
  minutos$: number;
  userName: string;
  status: boolean;
}
