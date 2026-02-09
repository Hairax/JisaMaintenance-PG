// mockDataTMEF.ts
export const activos = [
  {
    id: 'A1',
    nombre: 'Bomba Hidráulica',
    fechaInstalacion: '2024-01-10',
    ordenesTrabajo: [
      {
        id: 'OT-001',
        tipo: 'correctivo',
        estado: 'cerrada',
        fechaInicio: '2024-02-15',
        fechaFin: '2024-02-17',
        tipoFalla: 'Fuga de aceite',
      },
      {
        id: 'OT-002',
        tipo: 'preventivo',
        estado: 'cerrada',
        fechaInicio: '2024-03-01',
        fechaFin: '2024-03-01',
      },
      {
        id: 'OT-003',
        tipo: 'correctivo',
        estado: 'cerrada',
        fechaInicio: '2024-04-10',
        fechaFin: '2024-04-12',
        tipoFalla: 'Desgaste del sello',
      },
      {
        id: 'OT-004',
        tipo: 'correctivo',
        estado: 'cerrada',
        fechaInicio: '2024-06-05',
        fechaFin: '2024-06-07',
        tipoFalla: 'Motor quemado',
      },
    ],
  },
  {
    id: 'A2',
    nombre: 'Compresor de aire',
    fechaInstalacion: '2023-11-20',
    ordenesTrabajo: [
      {
        id: 'OT-005',
        tipo: 'correctivo',
        estado: 'cerrada',
        fechaInicio: '2024-01-25',
        fechaFin: '2024-01-26',
        tipoFalla: 'Fallo eléctrico',
      },
      {
        id: 'OT-006',
        tipo: 'correctivo',
        estado: 'cerrada',
        fechaInicio: '2024-04-02',
        fechaFin: '2024-04-03',
        tipoFalla: 'Presión insuficiente',
      },
      {
        id: 'OT-007',
        tipo: 'correctivo',
        estado: 'cerrada',
        fechaInicio: '2024-08-01',
        fechaFin: '2024-08-03',
        tipoFalla: 'Válvula defectuosa',
      },
    ],
  },
];
