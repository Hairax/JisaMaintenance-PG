import { UserRole } from '../enum/userRol.enum';
export class UserResponseDto {
  id: number;
  name: string;
  lastName: string;
  email: string;
  cargo: UserRole;
  phone: string;
  celphone: string;
  hora$: number;
  minutos$: number;
  userName: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
