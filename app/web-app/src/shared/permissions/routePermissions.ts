import { PermissionKey } from './permissions';

// Permiso mínimo requerido para poder ENTRAR a cada pantalla (no controla
// botones individuales dentro de la pantalla, salvo donde se indique lo
// contrario — ver Gestión de Usuarios, que sí filtra sus acciones de
// crear/editar/eliminar).
//
// Se resuelve por el prefijo de ruta más específico que coincida.
export const ROUTE_PERMISSIONS: Array<{ prefix: string; permission: PermissionKey }> = [
  { prefix: '/management/users', permission: 'verHistorialUsuarios' },
  { prefix: '/management/cost-centers', permission: 'verActivos' },
  { prefix: '/departamento', permission: 'verActivos' },
  { prefix: '/maquina', permission: 'verActivos' },
  { prefix: '/objeto', permission: 'verActivos' },
  { prefix: '/process', permission: 'verActivos' },
  { prefix: '/subunidad', permission: 'verActivos' },
  { prefix: '/tipo-mantenimiento', permission: 'verActivos' },
  { prefix: '/proveedores', permission: 'verInventario' },
  { prefix: '/repuestos', permission: 'verInventario' },
  { prefix: '/compras', permission: 'verInventario' },
  { prefix: '/salidas', permission: 'verInventario' },
  { prefix: '/informes', permission: 'registrarMantenimientoPreventivo' },
  { prefix: '/ot', permission: 'verOts' },
  { prefix: '/programacion-ot', permission: 'crearOt' },
  { prefix: '/dashboard', permission: 'verReportesBi' },
  { prefix: '/reportes', permission: 'verReportesBi' },
  { prefix: '/kpis', permission: 'visualizarKpis' },
];

/** Devuelve el permiso requerido para una ruta, o null si es de acceso libre para cualquier usuario autenticado. */
export function getRequiredPermission(pathname: string): PermissionKey | null {
  const match = ROUTE_PERMISSIONS.filter((r) => pathname.startsWith(r.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )[0];
  return match?.permission ?? null;
}
