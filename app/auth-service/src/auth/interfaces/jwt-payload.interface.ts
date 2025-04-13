import { UserRole } from '../enum/userRol.enum';

export interface JwtPayload {
  sub: number;
  userName: string;
  role: UserRole;
  email: string;
}
