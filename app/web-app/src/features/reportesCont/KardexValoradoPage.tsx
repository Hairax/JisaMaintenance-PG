import React, { useState } from 'react';
import * as XLSX from 'xlsx';
// Datos simulados para el Kardex Valorado
const kardexData = [
  {
    productoId: 'P-001',
    repuesto: 'Faja A12',
    fecha: '2025-06-30',
    movimiento: 'SALDO',
    documento: '0-OT18907-00',
    detalle: 'Saldo al 30/06/2025',
    ingresos: 0,
    salidas: 0,
    saldo: 5,
    costoBs: 50,
    ingresosValBs: 0,
    salidasValBs: 0,
    saldoValBs: 250,
  },
  {
    productoId: 'P-001',
    repuesto: 'Faja A12',
    fecha: '2025-07-01',
    movimiento: 'ENTRADA',
    documento: '0-OT18907-01',
    detalle: 'Compra proveedor',
    ingresos: 10,
    salidas: 0,
    saldo: 15,
    costoBs: 50,
    ingresosValBs: 500,
    salidasValBs: 0,
    saldoValBs: 750,
  },
  {
    productoId: 'P-001',
    repuesto: 'Faja A12',
    fecha: '2025-07-02',
    movimiento: 'SALIDA',
    documento: '0-OT18907-02',
    detalle: 'Consumo mantenimiento',
    ingresos: 0,
    salidas: 3,
    saldo: 12,
    costoBs: 50,
    ingresosValBs: 0,
    salidasValBs: 150,
    saldoValBs: 600,
  },
  {
    productoId: 'P-002',
    repuesto: 'Rodamiento 6204',
    fecha: '2025-07-04',
    movimiento: 'ENTRADA',
    documento: '0-OT18907-03',
    detalle: 'Compra proveedor',
    ingresos: 5,
    salidas: 0,
    saldo: 5,
    costoBs: 100,
    ingresosValBs: 500,
    salidasValBs: 0,
    saldoValBs: 500,
  },
  {
    productoId: 'P-001',
    repuesto: 'Faja A12',
    fecha: '2025-07-05',
    movimiento: 'SALIDA',
    documento: '0-OT18907-04',
    detalle: 'Consumo mantenimiento',
    ingresos: 0,
    salidas: 2,
    saldo: 10,
    costoBs: 50,
    ingresosValBs: 0,
    salidasValBs: 100,
    saldoValBs: 500,
  },
];

export default function KardexValoradoPage() {
  const [repuestoFiltro, setRepuestoFiltro] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const dataFiltrada = kardexData.filter((item) => {
    const cumpleRepuesto = item.repuesto
      .toLowerCase()
      .includes(repuestoFiltro.toLowerCase());
    const cumpleFechaInicio = !fechaInicio || item.fecha >= fechaInicio;
    const cumpleFechaFin = !fechaFin || item.fecha <= fechaFin;
    return cumpleRepuesto && cumpleFechaInicio && cumpleFechaFin;
  });

  const exportarExcel = () => {
    // Transformar los datos para el Excel con los headers solicitados
    const datosParaExportar = dataFiltrada.map((item) => ({
      'PRODUCTO ID': item.productoId || '',
      PRODUCTO: item.repuesto,
      Fecha: item.fecha,
      Documento: item.documento || '',
      Detalle: item.detalle || '',
      Ingresos: item.ingresos,
      Salidas: item.salidas,
      Saldo: item.saldo,
      'Costo Bs': item.costoBs,
      'Ingresos Val. Bs': item.ingresosValBs,
      'Salidas Val. Bs': item.salidasValBs,
      'Saldo Val. Bs': item.saldoValBs,
    }));

    // Agregar fila de rango de fechas al inicio si hay filtro
    let datosFinal = datosParaExportar;
    if (fechaInicio || fechaFin) {
      const rango = `Rango de fechas: ${fechaInicio || '...'} a ${fechaFin || '...'}`;
      datosFinal = [
        {
          'PRODUCTO ID': '',
          PRODUCTO: '',
          Fecha: rango,
          Documento: '',
          Detalle: '',
          Ingresos: 0,
          Salidas: 0,
          Saldo: 0,
          'Costo Bs': 0,
          'Ingresos Val. Bs': 0,
          'Salidas Val. Bs': 0,
          'Saldo Val. Bs': 0,
        },
        ...datosParaExportar,
      ];
    }

    // Crear hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(datosFinal);

    // Crear libro y añadir hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Kardex Valorado');

    // Descargar archivo
    XLSX.writeFile(libro, 'reporte_kardex_valorado.xlsx');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
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
          Kardex Valorado de Repuestos
        </h2>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-end',
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Buscar repuesto..."
            value={repuestoFiltro}
            onChange={(e) => setRepuestoFiltro(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              maxWidth: 200,
            }}
          />
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              maxWidth: 160,
            }}
            placeholder="Fecha inicio"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              maxWidth: 160,
            }}
            placeholder="Fecha fin"
          />
          <button
            onClick={() => {
              setRepuestoFiltro('');
              setFechaInicio('');
              setFechaFin('');
            }}
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
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  PRODUCTO ID
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  PRODUCTO
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Fecha
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Documento
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Detalle
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Ingresos
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Salidas
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Saldo
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Costo Bs
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Ingresos Val. Bs
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Salidas Val. Bs
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Saldo Val. Bs
                </th>
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.map((item, i) => (
                <tr
                  key={i}
                  style={{ background: i % 2 === 0 ? '#fff' : '#F5F5F5' }}
                >
                  <td style={{ padding: '0.75rem' }}>
                    {item.productoId || ''}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{item.repuesto}</td>
                  <td style={{ padding: '0.75rem' }}>{item.fecha}</td>
                  <td style={{ padding: '0.75rem' }}>{item.documento || ''}</td>
                  <td style={{ padding: '0.75rem' }}>{item.detalle || ''}</td>
                  <td style={{ padding: '0.75rem' }}>{item.ingresos}</td>
                  <td style={{ padding: '0.75rem' }}>{item.salidas}</td>
                  <td style={{ padding: '0.75rem' }}>{item.saldo}</td>
                  <td style={{ padding: '0.75rem' }}>{item.costoBs}</td>
                  <td style={{ padding: '0.75rem' }}>{item.ingresosValBs}</td>
                  <td style={{ padding: '0.75rem' }}>{item.salidasValBs}</td>
                  <td style={{ padding: '0.75rem' }}>{item.saldoValBs}</td>
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
                    No se encontraron repuestos.
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
