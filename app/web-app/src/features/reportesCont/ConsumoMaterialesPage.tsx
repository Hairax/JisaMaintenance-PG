import React, { useState } from 'react';
import * as XLSX from 'xlsx';

// Datos simulados para consumo de materiales e insumos
const consumoData = [
  {
    id: 1,
    fecha: '2025-07-01',
    area: 'Producción',
    material: 'Aceite Hidráulico',
    cantidad: 10,
    unidad: 'L',
    observaciones: 'Cambio programado en prensa hidráulica',
  },
  {
    id: 2,
    fecha: '2025-07-03',
    area: 'Mantenimiento',
    material: 'Tornillos M6x40',
    cantidad: 200,
    unidad: 'unid',
    observaciones: 'Reemplazo en estructura soporte',
  },
  {
    id: 3,
    fecha: '2025-07-05',
    area: 'Producción',
    material: 'Cables de Cobre 2mm',
    cantidad: 50,
    unidad: 'm',
    observaciones: 'Instalación nuevo motor',
  },
  {
    id: 4,
    fecha: '2025-07-07',
    area: 'Calidad',
    material: 'Guantes de Seguridad',
    cantidad: 30,
    unidad: 'pares',
    observaciones: 'Reposición de stock de seguridad',
  },
];

export default function ConsumoMaterialesPage() {
  const [filtro, setFiltro] = useState('');

  const dataFiltrada = consumoData.filter((item) =>
    filtro ? item.material.toLowerCase().includes(filtro.toLowerCase()) : true,
  );
  const exportarExcel = () => {
    // Transformar los datos para el Excel
    const datosParaExportar = dataFiltrada.map((item) => ({
      Fecha: item.fecha,
      Área: item.area,
      Material: item.material,
      Cantidad: item.cantidad,
      Unidad: item.unidad,
      Observaciones: item.observaciones,
    }));

    // Crear hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);

    // Crear libro y añadir hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Consumo');

    // Descargar archivo
    XLSX.writeFile(libro, 'reporte_consumo.xlsx');
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
          Consumo de Materiales e Insumos por Periodo
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
            placeholder="Filtrar por nombre del material"
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
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Área</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Material
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Cantidad
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Unidad
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
                  <td style={{ padding: '0.75rem' }}>{item.fecha}</td>
                  <td style={{ padding: '0.75rem' }}>{item.area}</td>
                  <td style={{ padding: '0.75rem' }}>{item.material}</td>
                  <td style={{ padding: '0.75rem' }}>{item.cantidad}</td>
                  <td style={{ padding: '0.75rem' }}>{item.unidad}</td>
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
