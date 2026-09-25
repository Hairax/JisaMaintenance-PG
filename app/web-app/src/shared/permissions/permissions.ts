import { UserRole } from '../types/user.types';

// Matriz de permisos por rol. Es la fuente única de verdad: la matriz que
// recibiste de la empresa, transcrita 1:1 (fila = acción, columna = rol).
//
// IMPORTANTE: esto es control de acceso a nivel de FRONTEND (qué se muestra,
// qué rutas se pueden abrir). No reemplaza validación en el backend — un
// usuario que llame directamente a la API podría saltárselo. Si más adelante
// se requiere seguridad real, hay que replicar estas reglas como guards en
// el api-gateway.

export type PermissionKey =
  | 'crearUsuarios'
  | 'editarUsuarios'
  | 'eliminarUsuarios'
  | 'verHistorialUsuarios'
  | 'asignarRoles'
  | 'iniciarSesion'
  | 'crearOt'
  | 'editarOt'
  | 'cerrarOt'
  | 'verOts'
  | 'filtrarOts'
  | 'asignarTecnicos'
  | 'verHistorialMantenimiento'
  | 'verActivos'
  | 'crearActivos'
  | 'editarActivos'
  | 'eliminarActivos'
  | 'registrarMantenimientoPreventivo'
  | 'registrarMantenimientoCorrectivo'
  | 'registrarCausaRaiz'
  | 'verInventario'
  | 'editarInventario'
  | 'crearRepuestosMateriales'
  | 'eliminarRepuestosMateriales'
  | 'verReportesBi'
  | 'visualizarKpis'
  | 'crearTicketServicio'
  | 'verEstadoTicket'
  | 'recibirNotificaciones'
  | 'verRepuestos'
  | 'gestionarCompras'
  | 'verReporteCompras'
  | 'cambiarContrasenas';

type RoleMap = Record<UserRole, boolean>;

const roles = (
  admin: boolean,
  supervisor: boolean,
  tecnico: boolean,
  externo: boolean,
  jefeMantenimiento: boolean,
  encargadoAlmacen: boolean,
  usuarioContable: boolean,
  encargadoCompras = false,
): RoleMap => ({
  [UserRole.ADMIN]: admin,
  [UserRole.SUPERVISOR]: supervisor,
  [UserRole.TECNICO]: tecnico,
  [UserRole.EXTERNO]: externo,
  [UserRole.JEFE_MANTENIMIENTO]: jefeMantenimiento,
  [UserRole.ENCARGADO_ALMACEN]: encargadoAlmacen,
  [UserRole.USUARIO_CONTABLE]: usuarioContable,
  [UserRole.ENCARGADO_COMPRAS]: encargadoCompras,
});

// admin, supervisor, tecnico, externo, jefeMantenimiento, encargadoAlmacen, usuarioContable, encargadoCompras
// prettier-ignore
export const PERMISSIONS_MATRIX: Record<PermissionKey, RoleMap> = {
  crearUsuarios: roles(true, false, false, false, true, false, false),
  editarUsuarios: roles(true, false, false, false, true, false, false),
  eliminarUsuarios: roles(true, false, false, false, true, false, false),
  verHistorialUsuarios: roles(true, true, false, false, true, true, true),
  asignarRoles: roles(true, false, false, false, true, false, false),
  iniciarSesion: roles(true, true, true, true, true, true, true, true),
  crearOt: roles(true, true, false, false, true, false, false),
  editarOt: roles(true, true, false, false, true, false, false),
  cerrarOt: roles(true, true, false, false, true, false, false),
  verOts: roles(true, true, true, false, true, true, true),
  filtrarOts: roles(true, true, true, false, true, true, true),
  asignarTecnicos: roles(true, true, false, false, true, false, false),
  verHistorialMantenimiento: roles(true, true, true, false, true, true, true),
  verActivos: roles(true, true, true, false, true, true, true),
  crearActivos: roles(true, true, false, false, true, false, false),
  editarActivos: roles(true, true, false, false, true, false, false),
  eliminarActivos: roles(true, true, false, false, true, false, false),
  registrarMantenimientoPreventivo: roles(true, true, true, false, true, false, false),
  registrarMantenimientoCorrectivo: roles(true, true, true, false, true, false, false),
  registrarCausaRaiz: roles(true, true, false, false, true, false, false),
  verInventario: roles(true, true, true, false, true, true, true),
  editarInventario: roles(true, false, false, false, true, true, false),
  crearRepuestosMateriales: roles(true, true, false, false, true, true, false),
  eliminarRepuestosMateriales: roles(true, true, false, false, true, true, false),
  verReportesBi: roles(true, true, false, false, true, false, true),
  visualizarKpis: roles(true, true, true, false, true, true, true),
  crearTicketServicio: roles(true, true, true, true, true, true, false),
  verEstadoTicket: roles(true, true, true, true, true, true, false),
  recibirNotificaciones: roles(true, true, true, true, true, true, true, true),
  // Pantallas a las que también entra el encargado de compras: mismos roles
  // que verInventario / verReportesBi, más encargadoCompras.
  verRepuestos: roles(true, true, true, false, true, true, true, true),
  gestionarCompras: roles(true, true, true, false, true, true, true, true),
  verReporteCompras: roles(true, true, false, false, true, false, true, true),
  // Solo el administrador (el backend también lo exige).
  cambiarContrasenas: roles(true, false, false, false, false, false, false, false),
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.SUPERVISOR]: 'Supervisor',
  [UserRole.TECNICO]: 'Técnico',
  [UserRole.EXTERNO]: 'Usuario Externo',
  [UserRole.JEFE_MANTENIMIENTO]: 'Jefe de Mantenimiento',
  [UserRole.ENCARGADO_ALMACEN]: 'Encargado de Almacén',
  [UserRole.USUARIO_CONTABLE]: 'Usuario Contable',
  [UserRole.ENCARGADO_COMPRAS]: 'Encargado de Compras',
};

export function hasPermission(
  role: UserRole | string | undefined | null,
  key: PermissionKey,
): boolean {
  if (!role) return false;
  return PERMISSIONS_MATRIX[key]?.[role as UserRole] ?? false;
}
