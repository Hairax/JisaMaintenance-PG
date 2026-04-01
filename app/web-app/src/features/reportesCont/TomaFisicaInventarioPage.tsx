import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

const API = 'http://localhost:3000';

interface Repuesto {
  id: number;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  descripcion: string;
  createdAt: string;
}

interface RepuestoMaquina extends Repuesto {
  maquina_id: number;
  subUnidad_id?: number | null;
}

interface CompraDetalle {
  tipoProducto: 'repuesto' | 'repuesto-maquina';
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Compra {
  id: number;
  nroDocumento: string;
  nroFactura: string;
  fecha: string;
  detalles: CompraDetalle[];
}

interface SalidaDetalle {
  tipoProducto: 'repuesto' | 'repuesto-maquina';
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Salida {
  id: number;
  nroSalida: string;
  fecha: string;
  detalles: SalidaDetalle[];
}

interface Movimiento {
  fecha: string;
  tipo: 'Creación' | 'Entrada' | 'Salida';
  referencia: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface InventarioRow {
  id: number;
  tipo: 'repuesto' | 'repuesto-maquina';
  nombre: string;
  descripcion: string;
  costoUnitario: number;
  cantidadSistema: number;
  createdAt: string;
  totalEntradas: number;
  totalSalidas: number;
  stockInicial: number;
  movimientos: Movimiento[];
}

const MOV_COLORS: Record<string, string> = {
  Creación: '#388E3C',
  Entrada: '#1565C0',
  Salida: '#D32F2F',
};

const MOV_BG: Record<string, string> = {
  Creación: '#E8F5E9',
  Entrada: '#E3F2FD',
  Salida: '#FFEBEE',
};

export default function TomaFisicaInventarioPage() {
  const [rows, setRows] = useState<InventarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<
    'todos' | 'repuesto' | 'repuesto-maquina'
  >('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resRep, resRepMaq, resCompras, resSalidas] = await Promise.all([
        fetch(`${API}/repuestos`),
        fetch(`${API}/repuesto-maquina`),
        fetch(`${API}/compras`),
        fetch(`${API}/salidas`),
      ]);

      const [repuestos, repuestosMaquina, compras, salidas] =
        (await Promise.all([
          resRep.ok ? resRep.json() : [],
          resRepMaq.ok ? resRepMaq.json() : [],
          resCompras.ok ? resCompras.json() : [],
          resSalidas.ok ? resSalidas.json() : [],
        ])) as [Repuesto[], RepuestoMaquina[], Compra[], Salida[]];

      const processItem = (
        item: Repuesto | RepuestoMaquina,
        tipo: 'repuesto' | 'repuesto-maquina',
      ): InventarioRow => {
        const movimientos: Movimiento[] = [];

        // Creation movement
        movimientos.push({
          fecha: item.createdAt,
          tipo: 'Creación',
          referencia: 'Registro inicial',
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.costoUnitario),
          subtotal: Number(item.cantidad) * Number(item.costoUnitario),
        });

        let totalEntradas = 0;
        for (const compra of Array.isArray(compras) ? compras : []) {
          for (const det of compra.detalles || []) {
            if (
              det.tipoProducto === tipo &&
              Number(det.productoId) === item.id
            ) {
              totalEntradas += Number(det.cantidad);
              movimientos.push({
                fecha: compra.fecha,
                tipo: 'Entrada',
                referencia: `Compra ${compra.nroDocumento || compra.nroFactura || `#${compra.id}`}`,
                cantidad: Number(det.cantidad),
                precioUnitario: Number(det.precioUnitario),
                subtotal: Number(det.subtotal),
              });
            }
          }
        }

        let totalSalidas = 0;
        for (const salida of Array.isArray(salidas) ? salidas : []) {
          for (const det of salida.detalles || []) {
            if (
              det.tipoProducto === tipo &&
              Number(det.productoId) === item.id
            ) {
              totalSalidas += Number(det.cantidad);
              movimientos.push({
                fecha: salida.fecha,
                tipo: 'Salida',
                referencia: `Salida ${salida.nroSalida || `#${salida.id}`}`,
                cantidad: Number(det.cantidad),
                precioUnitario: Number(det.precioUnitario),
                subtotal: Number(det.subtotal),
              });
            }
          }
        }

        movimientos.sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
        );

        const stockInicial = Math.max(
          0,
          Number(item.cantidad) + totalSalidas - totalEntradas,
        );

        return {
          id: item.id,
          tipo,
          nombre: item.nombre,
          descripcion: item.descripcion,
          costoUnitario: Number(item.costoUnitario),
          cantidadSistema: Number(item.cantidad),
          createdAt: item.createdAt,
          totalEntradas,
          totalSalidas,
          stockInicial,
          movimientos,
        };
      };

      const allRows: InventarioRow[] = [
        ...(Array.isArray(repuestos) ? repuestos : []).map((r) =>
          processItem(r, 'repuesto'),
        ),
        ...(Array.isArray(repuestosMaquina) ? repuestosMaquina : []).map((r) =>
          processItem(r, 'repuesto-maquina'),
        ),
      ];

      setRows(allRows);
    } catch (err) {
      setError(
        'Error al cargar los datos. Verifique la conexión con el servidor.',
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const datosFiltrados = rows.filter((row) => {
    const matchNombre =
      !filtroNombre ||
      row.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || row.tipo === filtroTipo;
    return matchNombre && matchTipo;
  });

  const exportarExcel = () => {
    const datos: Record<string, unknown>[] = [];
    for (const row of datosFiltrados) {
      datos.push({
        Nombre: row.nombre,
        Tipo: row.tipo === 'repuesto' ? 'Repuesto' : 'Repuesto Máquina',
        Descripcion: row.descripcion,
        'Costo Unitario': row.costoUnitario,
        'Stock Inicial (est.)': row.stockInicial,
        'Total Entradas': row.totalEntradas,
        'Total Salidas': row.totalSalidas,
        'Stock Actual': row.cantidadSistema,
        Tipo_Mov: '',
        Referencia: '',
        Fecha: '',
        Cantidad: '',
        'Precio Unitario': '',
        Subtotal: '',
      });
      for (const mov of row.movimientos) {
        datos.push({
          Nombre: '',
          Tipo: '',
          Descripcion: '',
          'Costo Unitario': '',
          'Stock Inicial (est.)': '',
          'Total Entradas': '',
          'Total Salidas': '',
          'Stock Actual': '',
          Tipo_Mov: mov.tipo,
          Referencia: mov.referencia,
          Fecha: mov.fecha
            ? new Date(mov.fecha).toLocaleDateString('es-BO')
            : '',
          Cantidad: mov.cantidad,
          'Precio Unitario': mov.precioUnitario,
          Subtotal: mov.subtotal,
        });
      }
    }
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Toma Física');
    XLSX.writeFile(libro, 'toma_fisica_inventario.xlsx');
  };

  const toggleExpand = (key: string) =>
    setExpandedId((prev) => (prev === key ? null : key));

  const tipoLabel = (tipo: string) =>
    tipo === 'repuesto' ? 'Repuesto' : 'Rep. Máquina';

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Cargando datos del inventario...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#D32F2F', marginBottom: 12 }}>{error}</p>
        <button
          onClick={cargarDatos}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: 8,
            background: '#FBAF11',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
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

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              flex: 1,
              minWidth: 200,
            }}
          />
          <select
            value={filtroTipo}
            onChange={(e) =>
              setFiltroTipo(
                e.target.value as 'todos' | 'repuesto' | 'repuesto-maquina',
              )
            }
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
            }}
          >
            <option value="todos">Todos los tipos</option>
            <option value="repuesto">Repuesto</option>
            <option value="repuesto-maquina">Repuesto Máquina</option>
          </select>
          <button
            onClick={() => {
              setFiltroNombre('');
              setFiltroTipo('todos');
            }}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#888',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Limpiar
          </button>
          <button
            onClick={cargarDatos}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#1565C0',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Actualizar
          </button>
          <button
            onClick={exportarExcel}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#FBAF11',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Exportar Excel
          </button>
        </div>

        {/* Summary stats */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          {[
            {
              label: 'Total Ítems',
              value: datosFiltrados.length,
              color: '#5D3312',
            },
            {
              label: 'Repuestos',
              value: datosFiltrados.filter((r) => r.tipo === 'repuesto').length,
              color: '#1565C0',
            },
            {
              label: 'Rep. Máquina',
              value: datosFiltrados.filter((r) => r.tipo === 'repuesto-maquina')
                .length,
              color: '#6A1B9A',
            },
            {
              label: 'Total Entradas',
              value: datosFiltrados.reduce((s, r) => s + r.totalEntradas, 0),
              color: '#1565C0',
            },
            {
              label: 'Total Salidas',
              value: datosFiltrados.reduce((s, r) => s + r.totalSalidas, 0),
              color: '#D32F2F',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#F5F5F5',
                borderRadius: 8,
                padding: '0.75rem 1.5rem',
                textAlign: 'center',
                minWidth: 110,
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: stat.color,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr style={{ background: '#E1CD9B' }}>
                <th style={{ padding: '0.75rem', width: 32 }} />
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Nombre
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tipo</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                  Costo Unit.
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                  Stock Inicial
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'right',
                    color: '#1565C0',
                  }}
                >
                  Entradas
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'right',
                    color: '#D32F2F',
                  }}
                >
                  Salidas
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                  Stock Actual
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
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
              {datosFiltrados.map((row, idx) => {
                const rowKey = `${row.tipo}-${row.id}`;
                const isExpanded = expandedId === rowKey;
                return (
                  <React.Fragment key={rowKey}>
                    <tr
                      style={{
                        background: idx % 2 === 0 ? '#fff' : '#F5F5F5',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleExpand(rowKey)}
                    >
                      <td
                        style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          color: '#888',
                        }}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>
                        {row.nombre}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: '0.78rem',
                            background:
                              row.tipo === 'repuesto' ? '#E3F2FD' : '#F3E5F5',
                            color:
                              row.tipo === 'repuesto' ? '#1565C0' : '#6A1B9A',
                            fontWeight: 500,
                          }}
                        >
                          {tipoLabel(row.tipo)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {row.costoUnitario.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {row.stockInicial}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          color: '#1565C0',
                          fontWeight: 500,
                        }}
                      >
                        {row.totalEntradas > 0 ? `+${row.totalEntradas}` : '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          color: '#D32F2F',
                          fontWeight: 500,
                        }}
                      >
                        {row.totalSalidas > 0 ? `-${row.totalSalidas}` : '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          fontWeight: 700,
                        }}
                      >
                        {row.cantidadSistema}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          color: '#666',
                          fontSize: '0.85rem',
                        }}
                      >
                        {row.descripcion}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={9}
                          style={{ padding: 0, background: '#F9F6EE' }}
                        >
                          <div style={{ padding: '1rem 2rem 1.25rem' }}>
                            <h4
                              style={{
                                margin: '0 0 0.75rem',
                                color: '#5D3312',
                                fontSize: '0.9rem',
                              }}
                            >
                              Historial de movimientos — {row.nombre}
                            </h4>
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.85rem',
                              }}
                            >
                              <thead>
                                <tr style={{ background: '#E1CD9B' }}>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    Fecha
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    Tipo
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    Referencia
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    Cantidad
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    Precio Unit.
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    Subtotal
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.movimientos.map((mov, mIdx) => (
                                  <tr
                                    key={mIdx}
                                    style={{
                                      background:
                                        mIdx % 2 === 0 ? '#fff' : '#F5F5F5',
                                    }}
                                  >
                                    <td style={{ padding: '0.5rem 0.75rem' }}>
                                      {mov.fecha
                                        ? new Date(
                                            mov.fecha,
                                          ).toLocaleDateString('es-BO')
                                        : '—'}
                                    </td>
                                    <td style={{ padding: '0.5rem 0.75rem' }}>
                                      <span
                                        style={{
                                          padding: '2px 8px',
                                          borderRadius: 10,
                                          fontSize: '0.78rem',
                                          background: MOV_BG[mov.tipo],
                                          color: MOV_COLORS[mov.tipo],
                                          fontWeight: 600,
                                        }}
                                      >
                                        {mov.tipo}
                                      </span>
                                    </td>
                                    <td style={{ padding: '0.5rem 0.75rem' }}>
                                      {mov.referencia}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                      }}
                                    >
                                      {mov.cantidad}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                      }}
                                    >
                                      {Number(mov.precioUnitario).toFixed(2)}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                      }}
                                    >
                                      {Number(mov.subtotal).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                                {row.movimientos.length === 0 && (
                                  <tr>
                                    <td
                                      colSpan={6}
                                      style={{
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        color: '#999',
                                      }}
                                    >
                                      Sin movimientos registrados
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
