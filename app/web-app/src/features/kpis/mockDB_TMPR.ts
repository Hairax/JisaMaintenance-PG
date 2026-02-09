// mockDB_TMPR.js
export const activos = [
  { id: 1, nombre: 'Bomba de Agua #1' },
  { id: 2, nombre: 'Generador Eléctrico #2' },
  { id: 3, nombre: 'Compresor de Aire #3' },
];

export const ordenesTrabajo = [
  {
    id: 101,
    activoId: 1,
    tipo: 'Correctivo',
    estado: 'Cerrada',
    fechaInicio: '2025-07-01T08:00:00',
    fechaFin: '2025-07-01T12:30:00',
    tecnicos: ['Juan Pérez', 'Carlos López'],
  },
  {
    id: 102,
    activoId: 1,
    tipo: 'Correctivo',
    estado: 'Cerrada',
    fechaInicio: '2025-07-05T09:00:00',
    fechaFin: '2025-07-05T14:15:00',
    tecnicos: ['Carlos López'],
  },
  {
    id: 103,
    activoId: 2,
    tipo: 'Correctivo',
    estado: 'Cerrada',
    fechaInicio: '2025-07-03T10:00:00',
    fechaFin: '2025-07-03T15:45:00',
    tecnicos: ['Juan Pérez'],
  },
  {
    id: 104,
    activoId: 2,
    tipo: 'Correctivo',
    estado: 'Cerrada',
    fechaInicio: '2025-07-06T11:00:00',
    fechaFin: '2025-07-06T13:20:00',
    tecnicos: ['María Torres'],
  },
  {
    id: 105,
    activoId: 3,
    tipo: 'Correctivo',
    estado: 'Cerrada',
    fechaInicio: '2025-07-02T08:00:00',
    fechaFin: '2025-07-02T11:40:00',
    tecnicos: ['Carlos López', 'María Torres'],
  },
];
