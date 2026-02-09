// src/mockData.ts
export type Maquina = {
  id: number;
  descripcion: string;
  fechaCreacion: string; // ISO date
};

export type OrdenTrabajo = {
  id: number;
  maquina_id: number;
  descripcionTarea: string;
  fechaCreacion: string; // ISO date-time
  fechaHora: string | null; // programada o inicio
  estado: string;
};

export type InformeDetalleTrabajo = {
  id: number;
  informeDiario_id: number;
  ordenTrabajo_id: number;
  fechaTrabajo: string; // "YYYY-MM-DD" fecha de la labor
  horaInicio: string; // "HH:MM"
  horaFin: string; // "HH:MM"
  descripcionLabor?: string;
};

// MÁQUINAS (activos)
export const maquinas: Maquina[] = [
  { id: 1, descripcion: 'Compresor A', fechaCreacion: '2024-01-10' },
  { id: 2, descripcion: 'Torno B', fechaCreacion: '2024-05-02' },
  { id: 3, descripcion: 'Bomba C', fechaCreacion: '2024-07-15' },
];

// ÓRDENES (ligadas a máquinas)
export const ordenes: OrdenTrabajo[] = [
  {
    id: 101,
    maquina_id: 1,
    descripcionTarea: 'Reparación sello',
    fechaCreacion: '2025-07-28T09:00:00',
    fechaHora: '2025-07-28T09:00:00',
    estado: 'CERRADA',
  },
  {
    id: 102,
    maquina_id: 1,
    descripcionTarea: 'Cambio filtro',
    fechaCreacion: '2025-08-04T10:00:00',
    fechaHora: '2025-08-04T10:00:00',
    estado: 'CERRADA',
  },
  {
    id: 201,
    maquina_id: 2,
    descripcionTarea: 'Alineacion',
    fechaCreacion: '2025-08-01T08:00:00',
    fechaHora: '2025-08-01T08:00:00',
    estado: 'CERRADA',
  },
  {
    id: 301,
    maquina_id: 3,
    descripcionTarea: 'Inspección',
    fechaCreacion: '2025-08-05T11:00:00',
    fechaHora: '2025-08-05T11:00:00',
    estado: 'CERRADA',
  },
];

// INFORMES DETALLE (horas de trabajo por OT → representan downtime en nuestro cálculo)
export const informeDetalles: InformeDetalleTrabajo[] = [
  // Compresor A: 28 jul -> 2 horas (09:00 - 11:00)
  {
    id: 1001,
    informeDiario_id: 5001,
    ordenTrabajo_id: 101,
    fechaTrabajo: '2025-07-28',
    horaInicio: '09:00',
    horaFin: '11:00',
  },
  // Compresor A: 4 ago -> 3 horas (10:00 - 13:00)
  {
    id: 1002,
    informeDiario_id: 5002,
    ordenTrabajo_id: 102,
    fechaTrabajo: '2025-08-04',
    horaInicio: '10:00',
    horaFin: '13:00',
  },

  // Torno B: 1 ago -> 1.5 horas (08:00 - 09:30)
  {
    id: 2001,
    informeDiario_id: 6001,
    ordenTrabajo_id: 201,
    fechaTrabajo: '2025-08-01',
    horaInicio: '08:00',
    horaFin: '09:30',
  },

  // Bomba C: 5 ago -> 0.75 horas (11:00 - 11:45)
  {
    id: 3001,
    informeDiario_id: 7001,
    ordenTrabajo_id: 301,
    fechaTrabajo: '2025-08-05',
    horaInicio: '11:00',
    horaFin: '11:45',
  },
];
