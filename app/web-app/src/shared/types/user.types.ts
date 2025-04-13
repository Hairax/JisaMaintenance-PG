export enum UserRole {
  EXTERNO = 'externo',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
}

export interface User {
  id: number;
  userName: string;
  name: string;
  lastName: string;
  email: string;
  cargo: UserRole;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  celphone: string;
  phone: string;
  hora$: number;
  minutos$: number;
}
