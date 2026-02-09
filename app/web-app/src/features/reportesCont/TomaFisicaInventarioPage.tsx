import React, { useState } from 'react';
import * as XLSX from 'xlsx';

// Datos simulados para toma física de inventario
const inventarioData = [
  {
    id: 1,
    codigo: 'REP-001',
    nombre: 'Filtro de Aceite',
    stockTeorico: 120,
    stockFisico: 115,
    diferencia: -5,
    observaciones: 'Faltante por ajuste de inventario anterior',
  },
  {
    id: 2,
    codigo: 'REP-002',
    nombre: 'Rodamiento 6203',
    stockTeorico: 60,
    stockFisico: 60,
    diferencia: 0,
    observaciones: 'Stock correcto',
  },
  {
    id: 3,
    codigo: 'REP-003',
    nombre: 'Lubricante Industrial',
    stockTeorico: 20,
    stockFisico: 22,
    diferencia: 2,
    observaciones: 'Excedente por error en entrada anterior',
  },
  {
    id: 4,
    codigo: 'REP-004',
    nombre: 'Correa Tipo A-42',
    stockTeorico: 15,
    stockFisico: 12,
    diferencia: -3,
    observaciones: 'Faltantes detectados en línea de producción',
  },
];

export default function TomaFisicaInventarioPage() {
  const [filtro, setFiltro] = useState('');

  const dataFiltrada = inventarioData.filter((item) =>
    filtro ? item.nombre.toLowerCase().includes(filtro.toLowerCase()) : true,
  );

  const exportarExcel = () => {
    // Transformar los datos para el Excel
    const datosParaExportar = dataFiltrada.map((item) => ({
      Código: item.codigo,
      Nombre: item.nombre,
      'Stock Teórico': item.stockTeorico,
      'Stock Físico': item.stockFisico,
      Diferencia: item.diferencia,
      Observaciones: item.observaciones,
    }));

    // Crear hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);

    // Crear libro y añadir hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Toma Física de Inventario');

    // Descargar archivo
    XLSX.writeFile(libro, 'reporte_toma_fisica_inventario.xlsx');
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
          Toma Física de Inventario
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
            placeholder="Filtrar por nombre del repuesto"
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
              background: '#FBAF11',
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
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Código
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Nombre
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Stock Teórico
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Stock Físico
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Diferencia
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.map((item) => (
                <tr
                  key={item.id}
                  style={{ background: item.id % 2 === 0 ? '#fff' : '#F5F5F5' }}
                >
                  <td style={{ padding: '0.75rem' }}>{item.codigo}</td>
                  <td style={{ padding: '0.75rem' }}>{item.nombre}</td>
                  <td style={{ padding: '0.75rem' }}>{item.stockTeorico}</td>
                  <td style={{ padding: '0.75rem' }}>{item.stockFisico}</td>
                  <td
                    style={{
                      padding: '0.75rem',
                      color:
                        item.diferencia < 0
                          ? '#D32F2F'
                          : item.diferencia > 0
                            ? '#388E3C'
                            : '#000',
                      fontWeight: 500,
                    }}
                  >
                    {item.diferencia > 0 ? '+' : ''}
                    {item.diferencia}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{item.observaciones}</td>
                </tr>
              ))}
              {dataFiltrada.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
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
