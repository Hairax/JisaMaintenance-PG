import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Datos simulados para el reporte de costos y gastos de mantenimiento
const mantenimientoData = [
  {
    id: 1,
    tipo: 'MANTENIMIENTO EDIFICIO',
    centroCosto: 'Almacén Central',
    descripcion: 'Reparación techo',
    fecha: '2025-07-01',
    costoTotal: 1200,
  },
  {
    id: 2,
    tipo: 'MANTENIMIENTO EQUIPOS',
    centroCosto: 'Producción Línea 1',
    descripcion: 'Cambio de motor',
    fecha: '2025-07-02',
    costoTotal: 2500,
  },
  {
    id: 3,
    tipo: 'MANTENIMIENTO INSTALACIONES',
    centroCosto: 'Zona de carga',
    descripcion: 'Pintura señalética',
    fecha: '2025-07-03',
    costoTotal: 800,
  },
  {
    id: 4,
    tipo: 'MANTENIMIENTO EQUIPOS',
    centroCosto: 'Producción Línea 2',
    descripcion: 'Ajuste de rodamiento',
    fecha: '2025-07-04',
    costoTotal: 950,
  },
];

export default function CostosMantenimientoPage() {
  const [tipoFiltro, setTipoFiltro] = useState('');

  const dataFiltrada = mantenimientoData.filter((item) =>
    tipoFiltro ? item.tipo === tipoFiltro : true,
  );

  const exportarExcel = () => {
    // Transformar los datos para el Excel
    const datosParaExportar = dataFiltrada.map((item) => ({
      Fecha: item.fecha,
      Tipo: item.tipo,
      'Centro de Costo': item.centroCosto,
      Descripción: item.descripcion,
      'Costo Total': item.costoTotal,
    }));

    // Crear hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);

    // Crear libro y añadir hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Mantenimiento');

    // Descargar archivo
    XLSX.writeFile(libro, 'reporte_mantenimiento.xlsx');
  };

  const tiposUnicos = Array.from(
    new Set(mantenimientoData.map((item) => item.tipo)),
  );

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
          Reporte de Costos y Gastos de Mantenimiento
        </h2>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-end',
            marginBottom: 24,
          }}
        >
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              maxWidth: 300,
            }}
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map((tipo, i) => (
              <option key={i} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          <button
            onClick={() => setTipoFiltro('')}
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
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tipo</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Centro de Costo
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Descripción
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
                  <td style={{ padding: '0.75rem' }}>{item.tipo}</td>
                  <td style={{ padding: '0.75rem' }}>{item.centroCosto}</td>
                  <td style={{ padding: '0.75rem' }}>{item.descripcion}</td>
                  <td style={{ padding: '0.75rem' }}>${item.costoTotal}</td>
                </tr>
              ))}
              {dataFiltrada.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
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
