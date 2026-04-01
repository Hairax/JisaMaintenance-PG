import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

const API = 'http://localhost:3000';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Repuesto {
  id: number;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  descripcion: string;
  createdAt: string;
}

interface CompraDetalle {
  compraId: number;
  tipoProducto: 'repuesto' | 'repuesto-maquina';
  productoId: number;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Compra {
  id: number;
  nroDocumento: string;
  nroFactura: string;
  detalle: string;
  fecha: string;
  detalles: CompraDetalle[];
}

interface SalidaDetalle {
  salidaId: number;
  tipoProducto: 'repuesto' | 'repuesto-maquina';
  productoId: number;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Salida {
  id: number;
  nroSalida: string;
  otId: number;
  fecha: string;
  observacion?: string;
  estado: string;
  detalles: SalidaDetalle[];
}

// ── Computed type ──────────────────────────────────────────────────────────────

interface KardexRow {
  productoId: number;
  repuesto: string;
  fecha: string; // YYYY-MM-DD
  movimiento: 'SALDO INICIAL' | 'ENTRADA' | 'SALIDA';
  documento: string;
  detalle: string;
  unidad: string;
  ingresos: number;
  salidas: number;
  saldo: number;
  costoBs: number;
  ingresosValBs: number;
  salidasValBs: number;
  saldoValBs: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const isoDate = (d: string | Date) => {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
};

const fmtDate = (d: string) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const fmtNum = (n: number, dec = 2) =>
  n.toLocaleString('es-BO', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });

// ── Kardex builder ─────────────────────────────────────────────────────────────

function buildKardex(
  repuestos: Repuesto[],
  compras: Compra[],
  salidas: Salida[],
): KardexRow[] {
  const rows: KardexRow[] = [];

  for (const rep of repuestos) {
    const costoBase = Number(rep.costoUnitario) || 0;

    // Collect purchase entries for this repuesto
    const entradas = compras.flatMap((c) =>
      (c.detalles ?? [])
        .filter(
          (d) =>
            d.tipoProducto === 'repuesto' && Number(d.productoId) === rep.id,
        )
        .map((d) => ({
          fecha: isoDate(c.fecha),
          documento: c.nroDocumento || c.nroFactura || `Compra #${c.id}`,
          detalle: c.detalle || 'Compra proveedor',
          cantidad: Number(d.cantidad),
          precio: Number(d.precioUnitario) || costoBase,
          unidad: d.unidadMedida || '',
        })),
    );

    // Collect salida exits for this repuesto
    const exits = salidas.flatMap((s) =>
      (s.detalles ?? [])
        .filter(
          (d) =>
            d.tipoProducto === 'repuesto' && Number(d.productoId) === rep.id,
        )
        .map((d) => ({
          fecha: isoDate(s.fecha),
          documento: s.nroSalida || `Salida #${s.id}`,
          detalle: s.observacion || `Consumo OT #${s.otId}`,
          cantidad: Number(d.cantidad),
          precio: Number(d.precioUnitario) || costoBase,
          unidad: d.unidadMedida || '',
        })),
    );

    if (entradas.length === 0 && exits.length === 0) continue;

    // Compute opening balance: current stock minus net of recorded movements
    const totalEntradas = entradas.reduce((s, e) => s + e.cantidad, 0);
    const totalSalidas = exits.reduce((s, e) => s + e.cantidad, 0);
    const saldoInicial = Number(rep.cantidad) - totalEntradas + totalSalidas;

    let saldoAcum = 0;

    // Opening balance row (only if positive — i.e. there was pre-existing stock)
    if (saldoInicial > 0) {
      saldoAcum = saldoInicial;
      rows.push({
        productoId: rep.id,
        repuesto: rep.nombre,
        fecha: isoDate(rep.createdAt),
        movimiento: 'SALDO INICIAL',
        documento: '—',
        detalle: 'Saldo inicial',
        unidad: '',
        ingresos: 0,
        salidas: 0,
        saldo: saldoAcum,
        costoBs: costoBase,
        ingresosValBs: 0,
        salidasValBs: 0,
        saldoValBs: saldoAcum * costoBase,
      });
    }

    // Sort movements chronologically; on same date, entries before exits
    type Mov = (typeof entradas)[0] & { type: 'ENTRADA' | 'SALIDA' };
    const movimientos: Mov[] = [
      ...entradas.map((e) => ({ ...e, type: 'ENTRADA' as const })),
      ...exits.map((e) => ({ ...e, type: 'SALIDA' as const })),
    ].sort(
      (a, b) =>
        a.fecha.localeCompare(b.fecha) || (a.type === 'ENTRADA' ? -1 : 1),
    );

    for (const mov of movimientos) {
      if (mov.type === 'ENTRADA') {
        saldoAcum += mov.cantidad;
        rows.push({
          productoId: rep.id,
          repuesto: rep.nombre,
          fecha: mov.fecha,
          movimiento: 'ENTRADA',
          documento: mov.documento,
          detalle: mov.detalle,
          unidad: mov.unidad,
          ingresos: mov.cantidad,
          salidas: 0,
          saldo: saldoAcum,
          costoBs: mov.precio,
          ingresosValBs: mov.cantidad * mov.precio,
          salidasValBs: 0,
          saldoValBs: saldoAcum * mov.precio,
        });
      } else {
        saldoAcum -= mov.cantidad;
        rows.push({
          productoId: rep.id,
          repuesto: rep.nombre,
          fecha: mov.fecha,
          movimiento: 'SALIDA',
          documento: mov.documento,
          detalle: mov.detalle,
          unidad: mov.unidad,
          ingresos: 0,
          salidas: mov.cantidad,
          saldo: saldoAcum,
          costoBs: mov.precio,
          ingresosValBs: 0,
          salidasValBs: mov.cantidad * mov.precio,
          saldoValBs: saldoAcum * mov.precio,
        });
      }
    }
  }

  // Sort: first by product name, then by date
  return rows.sort(
    (a, b) =>
      a.repuesto.localeCompare(b.repuesto) || a.fecha.localeCompare(b.fecha),
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

const TIPO_STYLE: Record<string, { bg: string; color: string }> = {
  'SALDO INICIAL': { bg: '#FFF3CD', color: '#856404' },
  ENTRADA: { bg: '#D4EDDA', color: '#155724' },
  SALIDA: { bg: '#F8D7DA', color: '#721C24' },
};

function TipoBadge({ tipo }: { tipo: string }) {
  const s = TIPO_STYLE[tipo] ?? { bg: '#E1CD9B', color: '#5D3312' };
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 10,
        background: s.bg,
        color: s.color,
        fontSize: '0.78rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {tipo}
    </span>
  );
}
// ── Component ─────────────────────────────────────────────────────────────────

export default function KardexValoradoPage() {
  const [repuestoFiltro, setRepuestoFiltro] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [kardexData, setKardexData] = useState<KardexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resRep, resComp, resSal] = await Promise.all([
        fetch(`${API}/repuestos`),
        fetch(`${API}/compras`),
        fetch(`${API}/salidas`),
      ]);
      const [repuestos, compras, salidas] = (await Promise.all([
        resRep.ok ? resRep.json() : [],
        resComp.ok ? resComp.json() : [],
        resSal.ok ? resSal.json() : [],
      ])) as [Repuesto[], Compra[], Salida[]];

      setKardexData(
        buildKardex(
          Array.isArray(repuestos) ? repuestos : [],
          Array.isArray(compras) ? compras : [],
          Array.isArray(salidas) ? salidas : [],
        ),
      );
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos. Verifique la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const dataFiltrada = useMemo(
    () =>
      kardexData.filter((item) => {
        const cumpleRepuesto =
          !repuestoFiltro ||
          item.repuesto.toLowerCase().includes(repuestoFiltro.toLowerCase());
        const cumpleFechaInicio = !fechaInicio || item.fecha >= fechaInicio;
        const cumpleFechaFin = !fechaFin || item.fecha <= fechaFin;
        return cumpleRepuesto && cumpleFechaInicio && cumpleFechaFin;
      }),
    [kardexData, repuestoFiltro, fechaInicio, fechaFin],
  );

  const exportarExcel = () => {
    const datosParaExportar = dataFiltrada.map((item) => ({
      'PRODUCTO ID': item.productoId,
      PRODUCTO: item.repuesto,
      Tipo: item.movimiento,
      Fecha: fmtDate(item.fecha),
      Documento: item.documento,
      Detalle: item.detalle,
      'U.M.': item.unidad,
      Ingresos: item.ingresos,
      Salidas: item.salidas,
      Saldo: item.saldo,
      'Costo Bs': item.costoBs,
      'Ingresos Val. Bs': item.ingresosValBs,
      'Salidas Val. Bs': item.salidasValBs,
      'Saldo Val. Bs': item.saldoValBs,
    }));

    let datosFinal = datosParaExportar;
    if (fechaInicio || fechaFin) {
      const rango = `Rango de fechas: ${fechaInicio || '...'} a ${fechaFin || '...'}`;
      datosFinal = [
        {
          'PRODUCTO ID': '' as unknown as number,
          PRODUCTO: '',
          Tipo: 'SALDO INICIAL' as const,
          Fecha: rango,
          Documento: '',
          Detalle: '',
          'U.M.': '',
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

    const hoja = XLSX.utils.json_to_sheet(datosFinal);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Kardex Valorado');
    XLSX.writeFile(libro, 'reporte_kardex_valorado.xlsx');
  };

  if (loading)
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
        Cargando Kardex...
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
          Kardex Valorado de Repuestos
        </h2>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-end',
            marginBottom: 20,
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.72rem', color: '#888' }}>
              Fecha inicio
            </span>
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
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: '1px solid #ccc',
                maxWidth: 160,
              }}
            />
          </div>
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
            {
              label: 'Repuestos',
              value: new Set(dataFiltrada.map((r) => r.productoId)).size,
              color: '#5D3312',
            },
            { label: 'Movimientos', value: dataFiltrada.length, color: '#555' },
            {
              label: 'Total Ingresos Val. Bs',
              value: fmtNum(
                dataFiltrada.reduce((s, r) => s + r.ingresosValBs, 0),
              ),
              color: '#155724',
            },
            {
              label: 'Total Salidas Val. Bs',
              value: fmtNum(
                dataFiltrada.reduce((s, r) => s + r.salidasValBs, 0),
              ),
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
                {[
                  'PRODUCTO ID',
                  'PRODUCTO',
                  'Tipo',
                  'Fecha',
                  'Documento',
                  'Detalle',
                  'U.M.',
                  'Ingresos',
                  'Salidas',
                  'Saldo',
                  'Costo Bs',
                  'Ingresos Val. Bs',
                  'Salidas Val. Bs',
                  'Saldo Val. Bs',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '0.65rem 0.75rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.map((item, i) => {
                const rowBg =
                  item.movimiento === 'SALDO INICIAL'
                    ? '#FFFBEA'
                    : item.movimiento === 'ENTRADA'
                      ? i % 2 === 0
                        ? '#F2FBF4'
                        : '#E8F5E9'
                      : i % 2 === 0
                        ? '#FFF5F5'
                        : '#FFEFEF';
                return (
                  <tr key={i} style={{ background: rowBg }}>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#888' }}>
                      {item.productoId}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 500 }}>
                      {item.repuesto}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <TipoBadge tipo={item.movimiento} />
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fmtDate(item.fecha)}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.82rem',
                        color: '#555',
                      }}
                    >
                      {item.documento}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.82rem',
                        color: '#555',
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.detalle}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.82rem',
                      }}
                    >
                      {item.unidad || '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        textAlign: 'right',
                        color: '#155724',
                        fontWeight: item.ingresos > 0 ? 600 : undefined,
                      }}
                    >
                      {item.ingresos > 0 ? fmtNum(item.ingresos) : '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        textAlign: 'right',
                        color: '#721C24',
                        fontWeight: item.salidas > 0 ? 600 : undefined,
                      }}
                    >
                      {item.salidas > 0 ? fmtNum(item.salidas) : '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        textAlign: 'right',
                        fontWeight: 700,
                      }}
                    >
                      {fmtNum(item.saldo)}
                    </td>
                    <td
                      style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}
                    >
                      {fmtNum(item.costoBs)}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        textAlign: 'right',
                        color: '#155724',
                      }}
                    >
                      {item.ingresosValBs > 0
                        ? fmtNum(item.ingresosValBs)
                        : '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        textAlign: 'right',
                        color: '#721C24',
                      }}
                    >
                      {item.salidasValBs > 0 ? fmtNum(item.salidasValBs) : '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        textAlign: 'right',
                        fontWeight: 700,
                      }}
                    >
                      {fmtNum(item.saldoValBs)}
                    </td>
                  </tr>
                );
              })}
              {dataFiltrada.length === 0 && (
                <tr>
                  <td
                    colSpan={14}
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: '#9E5533',
                    }}
                  >
                    No se encontraron movimientos de repuestos.
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
