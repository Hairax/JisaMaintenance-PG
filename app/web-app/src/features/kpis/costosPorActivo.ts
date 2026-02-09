// mock/costosPorActivo.ts
export const costosPorActivo = [
  {
    id: 1,
    nombre: 'Bomba hidráulica #1',
    tipo: 'Bomba',
    ordenes: [
      {
        id: 'OT-101',
        tipo: 'Preventivo',
        estado: 'Cerrada',
        fecha: '2025-01-10',
        costo: 250,
      },
      {
        id: 'OT-125',
        tipo: 'Correctivo',
        estado: 'Cerrada',
        fecha: '2025-03-14',
        costo: 480,
      },
      {
        id: 'OT-140',
        tipo: 'Correctivo',
        estado: 'Cerrada',
        fecha: '2025-06-01',
        costo: 320,
      },
    ],
  },
  {
    id: 2,
    nombre: 'Compresor de aire #3',
    tipo: 'Compresor',
    ordenes: [
      {
        id: 'OT-115',
        tipo: 'Correctivo',
        estado: 'Cerrada',
        fecha: '2025-02-20',
        costo: 900,
      },
      {
        id: 'OT-150',
        tipo: 'Preventivo',
        estado: 'Cerrada',
        fecha: '2025-07-05',
        costo: 300,
      },
    ],
  },
  {
    id: 3,
    nombre: 'Generador eléctrico #2',
    tipo: 'Generador',
    ordenes: [
      {
        id: 'OT-118',
        tipo: 'Correctivo',
        estado: 'Cerrada',
        fecha: '2025-03-15',
        costo: 1500,
      },
      {
        id: 'OT-130',
        tipo: 'Correctivo',
        estado: 'Cerrada',
        fecha: '2025-05-09',
        costo: 700,
      },
      {
        id: 'OT-170',
        tipo: 'Preventivo',
        estado: 'Cerrada',
        fecha: '2025-08-01',
        costo: 450,
      },
      {
        id: 'OT-175',
        tipo: 'Correctivo',
        estado: 'Cerrada',
        fecha: '2025-08-08',
        costo: 1200,
      },
    ],
  },
];
