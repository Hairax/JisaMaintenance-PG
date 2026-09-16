// Fuente única de verdad para los ítems de navegación del sidebar (desktop)
// y del menú inferior (mobile). Antes cada uno tenía su propia lista
// hardcodeada y se desincronizaban; ahora ambos importan de acá.

export interface NavLinkItem {
  to: string;
  text: string;
}

export const MANAGEMENT_ITEMS: NavLinkItem[] = [
  { to: '/management/users', text: 'Usuarios' },
  { to: '/management/cost-centers', text: 'Centros de Costos' },
  { to: '/departamento', text: 'Departamentos' },
  { to: '/maquina', text: 'Máquinas' },
  { to: '/objeto', text: 'Objetos' },
  { to: '/ot', text: 'Órdenes de Trabajo' },
  { to: '/programacion-ot', text: 'Programación Automática de OTs' },
  { to: '/programacion-ot/calendario', text: 'Calendario de Mantenimientos' },
  { to: '/process', text: 'Procesos' },
  { to: '/proveedores', text: 'Proveedores' },
  { to: '/repuestos', text: 'Repuestos' },
  { to: '/subunidad', text: 'Subunidades' },
  { to: '/tipo-mantenimiento', text: 'Tipos de Mantenimiento' },
  { to: '/informes', text: 'Informes Diarios' },
  { to: '/compras', text: 'Compras de Inventario' },
  { to: '/salidas', text: 'Salidas de Inventario' },
];

export const REPORTES_CONT_ITEMS: NavLinkItem[] = [
  { to: '/reportes/kardex', text: 'Kardex Valorado de Repuestos' },
  { to: '/reportes/costos', text: 'Costos de Mantenimiento' },
  {
    to: '/reportes/costos-ordenes-trabajo',
    text: 'Costos por Órdenes de Trabajo',
  },
  { to: '/reportes/compras-materiales', text: 'Compras de Materiales' },
  { to: '/reportes/consumo-materiales', text: 'Consumo de Materiales' },
  { to: '/reportes/tomas-inventario', text: 'Tomas Físicas de Inventario' },
  { to: '/reportes/mantenimiento-activo', text: 'Mantenimiento por Activo' },
];

export const KPI_ITEMS: NavLinkItem[] = [
  { to: '/kpis/disponibilidad', text: 'Disponibilidad' },
  { to: '/kpis/tmef', text: 'TMEF' },
  { to: '/kpis/tmpr', text: 'TMPR' },
  { to: '/kpis/costo-por-activo', text: 'Costo por Activo' },
];
