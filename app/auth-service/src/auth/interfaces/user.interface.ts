import { UserRole } from '../enum/userRol.enum';

export interface UserWithPassword {
  id: number;
  userName: string;
  email: string;
  cargo: UserRole;
  name: string;
  lastName: string;
  status: boolean;
  password: string; // 👈 necesario para validar
}
