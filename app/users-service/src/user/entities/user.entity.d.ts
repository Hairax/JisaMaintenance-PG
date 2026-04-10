declare enum UserRole {
  EXTERNO = 'externo',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
  JEFEMANTENIMIENTO = 'jefe-mantenimiento',
  ECARGADOALMACEN = 'encargado-almacen',
  USUARIOCONTABLE = 'usuario-contable',
}
export declare class User {
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
export {};
