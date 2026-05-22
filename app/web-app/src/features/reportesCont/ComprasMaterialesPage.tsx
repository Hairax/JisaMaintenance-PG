import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

const API = 'http://localhost:3000';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompraDetalle {
  id: number;
  compraId: number;
  tipoProducto: 'repuesto' | 'repuesto-maquina';
  productoId: number;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  porcentajeDescuento: number;
  descuentoMonto: number;
  subtotal: number;
}

interface Compra {
  id: number;
  nroDocumento: string;
  tipoDocumento: string;
  nroFactura: string;
  nit: string;
  proveedorId: number;
  proveedor?: { id: number; nombre?: string; name?: string };
  detalle: string;
  almacen: string;
  fecha: string;
  tipoCambio: number;
  nroAutorizacion: string;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  detalles: CompraDetalle[];
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const fmtNum = (n: number) =>
  n.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const proveedorNombre = (c: Compra) =>
  c.proveedor?.nombre ?? c.proveedor?.name ?? `Proveedor #${c.proveedorId}`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ComprasMaterialesPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [expandido, setExpandido] = useState<number | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/compras`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: Compra[] = await res.json();
      setCompras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        'Error al cargar las compras. Verifique la conexión con el servidor.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const proveedores = useMemo(
    () => ['todos', ...Array.from(new Set(compras.map(proveedorNombre)))],
    [compras],
  );

  const dataFiltrada = useMemo(
    () =>
      compras.filter((c) => {
        const fechaStr = c.fecha ? c.fecha.slice(0, 10) : '';
        const matchFiltro =
          !filtro ||
          c.nroDocumento?.toLowerCase().includes(filtro.toLowerCase()) ||
          c.nroFactura?.toLowerCase().includes(filtro.toLowerCase()) ||
          c.detalle?.toLowerCase().includes(filtro.toLowerCase()) ||
          (c.detalles ?? []).some((d) =>
            d.nombre?.toLowerCase().includes(filtro.toLowerCase()),
          );
        const matchProveedor =
          filtroProveedor === 'todos' ||
          !filtroProveedor ||
          proveedorNombre(c) === filtroProveedor;
        const matchInicio = !fechaInicio || fechaStr >= fechaInicio;
        const matchFin = !fechaFin || fechaStr <= fechaFin;
        return matchFiltro && matchProveedor && matchInicio && matchFin;
      }),
    [compras, filtro, filtroProveedor, fechaInicio, fechaFin],
  );

  const exportarExcel = () => {
    // Definimos el orden estricto de las columnas basándonos en la imagen de reporte_compras
    const headers = [
      'N° Documento',
      'Tipo Doc.',
      'N° Factura',
      'NIT',
      'Proveedor',
      'Almacén',
      'Detalle',
      'Fecha',
      'Código',
      'Material',
      'U.M.',
      'Cantidad',
      'P. Unit. Bs',
      'Descuento Bs',
      'Subtotal Bs',
      'Costo Bs',
      'Valorado Bs.',
    ];

    // Array de arrays: la primera fila serán los encabezados obligatoriamente
    const datosHoja: any[][] = [headers];

    for (const c of dataFiltrada) {
      // Si la compra no tiene detalles, evitamos que rompa metiendo campos vacíos alineados
      const detalles =
        (c.detalles ?? []).length === 0
          ? [
              {
                nombre: '',
                codigo: '',
                unidadMedida: '',
                cantidad: 0,
                precioUnitario: 0,
                porcentajeDescuento: 0,
                subtotal: 0,
              },
            ]
          : c.detalles;

      for (const d of detalles) {
        // --- 1. Mapeo y formateo estricto de tipos de datos ---

        // Celdas numéricas con fallback a 0 para que Excel no reciba NaN o undefined
        const cantidad = Number(d.cantidad) || 0;
        const pUnitario = Number(d.precioUnitario) || 0;
        const descuentoBs = Number(c.descuentoTotal) || 0; // O la lógica que manejes por ítem
        const subtotal = Number(d.subtotal) || 0;

        // Lógica de Costo (según tu Excel suele ser igual al subtotal o pUnitario según la estructura)
        const costoBs = subtotal;

        // Nueva columna solicitada: Precio menos el 13% de IVA (Valorado Bs.)
        const valoradoBs = subtotal * 0.87;

        // Fecha como objeto Date nativo (imprescindible para que Excel lo reconozca como tipo Fecha)
        const fechaObjeto = c.fecha ? new Date(c.fecha) : '';

        // Construimos la fila respetando rigurosamente el orden de las columnas de la captura
        const fila = [
          c.nroDocumento || '',
          c.tipoDocumento || '',
          c.nroFactura || '',
          c.nit || '',
          proveedorNombre(c),
          c.almacen || '',
          c.detalle || '',
          fechaObjeto, // Columna H: Fecha (Tipo Date)
          d.codigo || '', // Columna I: Código
          d.nombre, // Columna J: Material
          d.unidadMedida, // Columna K: U.M.
          cantidad, // Columna L: Cantidad (Tipo Number)
          pUnitario, // Columna M: P. Unit. Bs (Tipo Number)
          descuentoBs, // Columna N: Descuento Bs (Tipo Number)
          subtotal, // Columna O: Subtotal Bs (Tipo Number)
          costoBs, // Columna P: Costo Bs (Tipo Number)
          valoradoBs, // Columna Q: Valorado Bs. (Precio menos 13%) (Tipo Number)
        ];

        datosHoja.push(fila);
      }
    }

    // Creamos la hoja directamente desde un Array de Arrays (aoa) para asegurar el orden de columnas
    const hoja = XLSX.utils.aoa_to_sheet(datosHoja);

    // --- 2. Forzar formatos de celda en Excel ---
    // Nos aseguramos de que Excel sepa cómo renderizar visualmente los números sin perder el tipo "number"
    const rango = XLSX.utils.decode_range(hoja['!ref'] || 'A1:A1');
    for (let R = 1; R <= rango.e.r; ++R) {
      // Empezamos en 1 para saltarnos los encabezados

      // Formato para columnas de dinero (L, M, N, O, P, Q) -> ÍNDICES: 11, 12, 13, 14, 15, 16
      const columnasMoneda = [12, 13, 14, 15, 16];
      columnasMoneda.forEach((colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: colIdx });
        if (hoja[cellRef] && hoja[cellRef].t === 'n') {
          hoja[cellRef].z = '#,##0.00'; // Formato numérico estándar de contabilidad/decimales
        }
      });

      // Formato para la columna de Cantidad (Columna L -> Índice 11)
      const cantRef = XLSX.utils.encode_cell({ r: R, c: 11 });
      if (hoja[cantRef] && hoja[cantRef].t === 'n') {
        hoja[cantRef].z = '#,##0'; // Enteros o decimales simples
      }

      // Formato para la columna de Fecha (Columna H -> Índice 7)
      const fechaRef = XLSX.utils.encode_cell({ r: R, c: 7 });
      if (hoja[fechaRef] && hoja[fechaRef].t === 'd') {
        hoja[fechaRef].z = 'dd/mm/yyyy'; // Formato de fecha para es-BO
      }
    }

    const libro = XLSX.utils.book_new();

    // cellDates: true es VITAL para que la librería no transforme los objetos Date en strings numéricos extraños
    XLSX.utils.book_append_sheet(libro, hoja, 'Compras');
    XLSX.writeFile(libro, 'reporte_compras.xlsx', { cellDates: true });
  };

  if (loading)
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
        Cargando compras...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#C62828', marginBottom: 12 }}>{error}</p>
        <button
          onClick={cargarDatos}
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
          Reintentar
        </button>
      </div>
    );

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
          Registro de Compras de Materiales e Insumos
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
            placeholder="Buscar por material, doc. o detalle..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              minWidth: 220,
              flex: 1,
            }}
          />
          <select
            value={filtroProveedor}
            onChange={(e) => setFiltroProveedor(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #ccc',
            }}
          >
            {proveedores.map((p) => (
              <option key={p} value={p}>
                {p === 'todos' ? 'Todos los proveedores' : p}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.72rem', color: '#888' }}>
              Fecha inicio
            </span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.72rem', color: '#888' }}>
              Fecha fin
            </span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid #ccc',
              }}
            />
          </div>
          <button
            onClick={() => {
              setFiltro('');
              setFiltroProveedor('');
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
            onClick={cargarDatos}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#1565C0',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
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

        {/* Summary pills */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          {[
            { label: 'Compras', value: dataFiltrada.length, color: '#5D3312' },
            {
              label: 'Ítems',
              value: dataFiltrada.reduce(
                (s, c) => s + (c.detalles?.length ?? 0),
                0,
              ),
              color: '#555',
            },
            {
              label: 'Total Bs',
              value: `Bs ${fmtNum(dataFiltrada.reduce((s, c) => s + Number(c.total), 0))}`,
              color: '#155724',
            },
            {
              label: 'Descuentos Bs',
              value: `Bs ${fmtNum(dataFiltrada.reduce((s, c) => s + Number(c.descuentoTotal), 0))}`,
              color: '#721C24',
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: '#F5F5F5',
                borderRadius: 8,
                padding: '6px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#888' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr style={{ background: '#E1CD9B' }}>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    width: 28,
                  }}
                />
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Fecha
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  N° Documento
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  N° Factura
                </th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>
                  Proveedor
                </th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>
                  Detalle
                </th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>
                  Almacén
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Subtotal Bs
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Descuento Bs
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Total Bs
                </th>
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
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
              {dataFiltrada.map((c, i) => {
                const isExp = expandido === c.id;
                return (
                  <>
                    <tr
                      key={c.id}
                      style={{
                        background: i % 2 === 0 ? '#fff' : '#F5F5F5',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandido(isExp ? null : c.id)}
                    >
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'center',
                          color: '#aaa',
                          fontSize: '0.8rem',
                        }}
                      >
                        {isExp ? '▼' : '▶'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fmtDate(c.fecha)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontWeight: 600,
                          color: '#5D3312',
                        }}
                      >
                        {c.nroDocumento || '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontSize: '0.82rem',
                          color: '#555',
                        }}
                      >
                        {c.nroFactura || '—'}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        {proveedorNombre(c)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontSize: '0.82rem',
                          color: '#555',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.detalle || '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontSize: '0.82rem',
                        }}
                      >
                        {c.almacen || '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'right',
                        }}
                      >
                        {fmtNum(Number(c.subtotal))}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'right',
                          color: '#721C24',
                        }}
                      >
                        {Number(c.descuentoTotal) > 0
                          ? fmtNum(Number(c.descuentoTotal))
                          : '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: '#155724',
                        }}
                      >
                        {fmtNum(Number(c.total))}
                      </td>
                    </tr>
                    {isExp && (
                      <tr key={`det-${c.id}`} style={{ background: '#FAFAFA' }}>
                        <td
                          colSpan={10}
                          style={{ padding: '0 1rem 1rem 2.5rem' }}
                        >
                          {(c.detalles ?? []).length === 0 ? (
                            <p
                              style={{
                                color: '#aaa',
                                fontSize: '0.82rem',
                                margin: '0.5rem 0',
                              }}
                            >
                              Sin ítems registrados.
                            </p>
                          ) : (
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.82rem',
                                marginTop: 8,
                              }}
                            >
                              <thead>
                                <tr style={{ background: '#F0E8D0' }}>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    Material
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    Código
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
                                      textAlign: 'right',
                                    }}
                                  >
                                    Cantidad
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    U.M.
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    P. Unit. Bs
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    Desc. %
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    Subtotal Bs
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {c.detalles.map((d, di) => (
                                  <tr
                                    key={di}
                                    style={{
                                      background:
                                        di % 2 === 0 ? '#fff' : '#F9F6EE',
                                    }}
                                  >
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        fontWeight: 500,
                                      }}
                                    >
                                      {d.nombre}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        color: '#888',
                                      }}
                                    >
                                      {d.codigo || '—'}
                                    </td>
                                    <td style={{ padding: '0.5rem 0.75rem' }}>
                                      <span
                                        style={{
                                          padding: '1px 7px',
                                          borderRadius: 8,
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          background:
                                            d.tipoProducto === 'repuesto'
                                              ? '#E3F2FD'
                                              : '#F3E5F5',
                                          color:
                                            d.tipoProducto === 'repuesto'
                                              ? '#1565C0'
                                              : '#6A1B9A',
                                        }}
                                      >
                                        {d.tipoProducto === 'repuesto'
                                          ? 'Repuesto'
                                          : 'Rep. Máq.'}
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                      }}
                                    >
                                      {fmtNum(Number(d.cantidad))}
                                    </td>
                                    <td style={{ padding: '0.5rem 0.75rem' }}>
                                      {d.unidadMedida}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                      }}
                                    >
                                      {fmtNum(Number(d.precioUnitario))}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                        color: '#721C24',
                                      }}
                                    >
                                      {Number(d.porcentajeDescuento) > 0
                                        ? `${Number(d.porcentajeDescuento).toFixed(1)}%`
                                        : '—'}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                        fontWeight: 700,
                                      }}
                                    >
                                      {fmtNum(Number(d.subtotal))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
