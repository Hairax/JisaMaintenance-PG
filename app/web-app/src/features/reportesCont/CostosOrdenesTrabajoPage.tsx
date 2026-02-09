import React, { useState } from 'react';
import * as XLSX from 'xlsx';

// Datos simulados para el reporte de costos por órdenes de trabajo
const ordenesTrabajoData = [
  {
    id: 1,
    codigo: 'OT-001',
    activo: 'Compresor A',
    fecha: '2025-07-01',
    manoObra: 600,
    materiales: 300,
    serviciosExternos: 200,
  },
  {
    id: 2,
    codigo: 'OT-002',
    activo: 'Cinta Transportadora 2',
    fecha: '2025-07-02',
    manoObra: 450,
    materiales: 150,
    serviciosExternos: 100,
  },
  {
    id: 3,
    codigo: 'OT-003',
    activo: 'Bomba Hidráulica B',
    fecha: '2025-07-04',
    manoObra: 750,
    materiales: 500,
    serviciosExternos: 350,
  },
  {
    id: 4,
    codigo: 'OT-004',
    activo: 'Panel Eléctrico Principal',
    fecha: '2025-07-05',
    manoObra: 300,
    materiales: 200,
    serviciosExternos: 150,
  },
];

export default function CostosOrdenesTrabajoPage() {
  const [filtro, setFiltro] = useState('');

  const dataFiltrada = ordenesTrabajoData.filter((item) =>
    filtro ? item.activo.toLowerCase().includes(filtro.toLowerCase()) : true,
  );

  const exportarExcel = () => {
    // Transformar los datos para el Excel
    const datosParaExportar = dataFiltrada.map((item) => ({
      Fecha: item.fecha,
      'Código OT': item.codigo,
      Activo: item.activo,
      'Mano de Obra': item.manoObra,
      Materiales: item.materiales,
      'Servicios Externos': item.serviciosExternos,
      'Costo Total': item.manoObra + item.materiales + item.serviciosExternos,
    }));

    // Crear hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);

    // Crear libro y añadir hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Órdenes de Trabajo');

    // Descargar archivo
    XLSX.writeFile(libro, 'reporte_ordenes_trabajo.xlsx');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          Costos Totales por Órdenes de Trabajo
        </h2>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-end',
            marginBottom: 24,
          }}
        >
          <input
            type="text"
            placeholder="Filtrar por nombre de activo"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              flex: 1,
            }}
          />
          <button
            onClick={() => setFiltro('')}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#FBAF11',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Limpiar
          </button>
          <button
            onClick={exportarExcel}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Exportar a Excel
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '1rem',
            }}
          >
            <thead>
              <tr style={{ background: '#E1CD9B' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Código OT
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Activo
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Mano de Obra
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Materiales
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Servicios Externos
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Costo Total
                </th>
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.map((item) => (
                <tr
                  key={item.id}
                  style={{ background: item.id % 2 === 0 ? '#fff' : '#F5F5F5' }}
                >
                  <td style={{ padding: '0.75rem' }}>{item.fecha}</td>
                  <td style={{ padding: '0.75rem' }}>{item.codigo}</td>
                  <td style={{ padding: '0.75rem' }}>{item.activo}</td>
                  <td style={{ padding: '0.75rem' }}>${item.manoObra}</td>
                  <td style={{ padding: '0.75rem' }}>${item.materiales}</td>
                  <td style={{ padding: '0.75rem' }}>
                    ${item.serviciosExternos}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    ${item.manoObra + item.materiales + item.serviciosExternos}
                  </td>
                </tr>
              ))}
              {dataFiltrada.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: '#9E5533',
                    }}
                  >
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
