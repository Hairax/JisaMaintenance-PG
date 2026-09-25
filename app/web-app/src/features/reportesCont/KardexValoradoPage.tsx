import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { API_URL } from '../../shared/config/api';

const API = API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Repuesto {
  id: number;
  tipo: 'NORMAL' | 'LIBRE';
  codigoPersonalizado?: string;
  nombre: string;
  codigo?: string;
  correlativo?: number;
  uMedida?: string;
  centroCosto_id?: number;
  proceso_id?: number;
  maquina_id?: number;
  subUnidad_id?: number;
  cantidad: number;
  costoUnitario: number;
  descripcion: string;
  createdAt: string;
}

interface CompraDetalle {
  compraId: number;
  tipoProducto?: 'repuesto' | 'repuesto-maquina';
  repuestoId: number;
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
  repuestoId: number;
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
  codigo: string;
  producto: string;
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

// ── Colors ────────────────────────────────────────────────────────────────────

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

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

function buildCompositeId(r: Repuesto) {
  if (r.tipo === 'LIBRE') {
    return r.codigoPersonalizado || String(r.id);
  }
  const parts: string[] = [];
  if (r.centroCosto_id) parts.push(String(r.centroCosto_id));
  if (r.proceso_id) parts.push(String(r.proceso_id).padStart(2, '0'));
  if (r.maquina_id) parts.push(String(r.maquina_id).padStart(2, '0'));
  if (r.subUnidad_id) parts.push(String(r.subUnidad_id).padStart(2, '0'));
  if (r.subUnidad_id && r.correlativo)
    parts.push(String(r.correlativo).padStart(3, '0'));
  return parts.join('.');
}

// ── Kardex builder ─────────────────────────────────────────────────────────────

function buildKardex(
  repuestos: Repuesto[],
  compras: Compra[],
  salidas: Salida[],
): KardexRow[] {
  console.log(
    'Building kardex for',
    repuestos.length,
    'repuestos,',
    compras.length,
    'compras,',
    salidas.length,
    'salidas',
  );
  const rows: KardexRow[] = [];

  for (const rep of repuestos) {
    const costoBase = Number(rep.costoUnitario) || 0;

    // Collect purchase entries for this repuesto
    const entradas = compras.flatMap((c) =>
      (c.detalles ?? [])
        .filter((d) => {
          const detalleId = Number(
            d.repuestoId ?? (d as { productoId?: number }).productoId,
          );
          const detalleTipo = d.tipoProducto;
          return (
            (!detalleTipo || detalleTipo === 'repuesto') && detalleId === rep.id
          );
        })
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
        .filter((d) => {
          const detalleId = Number(
            d.repuestoId ?? (d as { productoId?: number }).productoId,
          );
          return d.tipoProducto === 'repuesto' && detalleId === rep.id;
        })
        .map((d) => ({
          fecha: isoDate(s.fecha),
          documento: s.nroSalida || `Salida #${s.id}`,
          detalle: s.observacion || `Consumo OT #${s.otId}`,
          cantidad: Number(d.cantidad),
          precio: Number(d.precioUnitario) || costoBase,
          unidad: d.unidadMedida || '',
        })),
    );

    const codigo = rep.codigo || buildCompositeId(rep) || String(rep.id);
    const totalEntradas = entradas.reduce((s, e) => s + e.cantidad, 0);
    const totalSalidas = exits.reduce((s, e) => s + e.cantidad, 0);
    const saldoInicial = Number(rep.cantidad) - totalEntradas + totalSalidas;

    console.log(
      'rep',
      rep.id,
      codigo,
      'entradas',
      entradas.length,
      'exits',
      exits.length,
    );

    let saldoAcum = saldoInicial;

    rows.push({
      productoId: rep.id,
      codigo,
      producto: rep.nombre,
      fecha: isoDate(rep.createdAt),
      movimiento: 'SALDO INICIAL',
      documento: '—',
      detalle: 'Saldo inicial',
      unidad: rep.uMedida || '',
      ingresos: 0,
      salidas: 0,
      saldo: saldoAcum,
      costoBs: costoBase,
      ingresosValBs: 0,
      salidasValBs: 0,
      saldoValBs: saldoAcum * costoBase,
    });

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
          codigo,
          producto: rep.nombre,
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
          codigo,
          producto: rep.nombre,
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

  // Sort: first by product code, then by date
  return rows.sort(
    (a, b) =>
      a.codigo.localeCompare(b.codigo) || a.fecha.localeCompare(b.fecha),
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

const TIPO_STYLE: Record<string, { bg: string; color: string }> = {
  'SALDO INICIAL': { bg: '#FFF3CD', color: '#856404' },
  ENTRADA: { bg: '#D4EDDA', color: '#155724' },
  SALIDA: { bg: '#F8D7DA', color: '#721C24' },
};

function TipoBadge({ tipo }: { tipo: string; theme: string }) {
  const s = TIPO_STYLE[tipo] ?? {
    bg: 'var(--app-head-bg)',
    color: 'var(--app-brand-text)',
  };
  // For dark mode, adjust colors if needed, but for now keep as is
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
  const { theme } = useTheme();

  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const theadBgColor = theme === 'dark' ? colors.brown : colors.gold;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const successColor = theme === 'dark' ? '#4ADE80' : '#22863a';
  const errorColor = theme === 'dark' ? '#EF4444' : '#C62828';
  const buttonPrimaryBg = theme === 'dark' ? '#1565C0' : '#1565C0';
  const buttonSecondaryBg = theme === 'dark' ? '#FBAF11' : '#FBAF11';
  const buttonSuccessBg = theme === 'dark' ? '#4CAF50' : '#4CAF50';

  const saldoInicialBg = theme === 'dark' ? '#2A2A1A' : '#FFFBEA';
  const entradaBg1 = theme === 'dark' ? '#1A2A1A' : '#F2FBF4';
  const entradaBg2 = theme === 'dark' ? '#0F1F0F' : '#E8F5E9';
  const salidaBg1 = theme === 'dark' ? '#2A1A1A' : '#FFF5F5';
  const salidaBg2 = theme === 'dark' ? '#1F0F0F' : '#FFEFEF';

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

      console.log('API data', {
        repuestos: Array.isArray(repuestos) ? repuestos.length : 0,
        compras: Array.isArray(compras) ? compras.length : 0,
        salidas: Array.isArray(salidas) ? salidas.length : 0,
      });

      const rows = buildKardex(
        Array.isArray(repuestos) ? repuestos : [],
        Array.isArray(compras) ? compras : [],
        Array.isArray(salidas) ? salidas : [],
      );
      setKardexData(rows);
      console.log('Kardex data loaded:', rows.length, 'rows');
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
        const filter = repuestoFiltro.toLowerCase();
        const cumpleRepuesto =
          !repuestoFiltro ||
          [item.codigo, item.producto].join(' ').toLowerCase().includes(filter);
        const cumpleFechaInicio = !fechaInicio || item.fecha >= fechaInicio;
        const cumpleFechaFin = !fechaFin || item.fecha <= fechaFin;
        return cumpleRepuesto && cumpleFechaInicio && cumpleFechaFin;
      }),
    [kardexData, repuestoFiltro, fechaInicio, fechaFin],
  );

  const exportarExcel = () => {
    const datosParaExportar = dataFiltrada.map((item) => ({
      CODIGO: item.codigo,
      PRODUCTO: item.producto,
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
          CODIGO: '',
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
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: secondaryTextColor,
        }}
      >
        Cargando Kardex...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: errorColor, marginBottom: 12 }}>{error}</p>
        <button
          onClick={cargarDatos}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: 8,
            background: buttonSecondaryBg,
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
    <div
      style={{
        padding: 'clamp(1rem, 4vw, 2rem)',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: bgColor,
          borderRadius: 12,
          boxShadow: 'var(--app-shadow)',
          padding: 'clamp(1rem, 4vw, 2rem)',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            color: textColor,
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
              border: `1px solid ${inputBorderColor}`,
              background: inputBgColor,
              color: textColor,
              flex: '1 1 180px',
              maxWidth: 260,
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              flex: '1 1 130px',
              maxWidth: 180,
            }}
          >
            <span
              style={{ fontSize: '0.72rem', color: 'var(--app-text-subtle)' }}
            >
              Fecha inicio
            </span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: `1px solid ${inputBorderColor}`,
                background: inputBgColor,
                color: textColor,
                width: '100%',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              flex: '1 1 130px',
              maxWidth: 180,
            }}
          >
            <span
              style={{ fontSize: '0.72rem', color: 'var(--app-text-subtle)' }}
            >
              Fecha fin
            </span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: `1px solid ${inputBorderColor}`,
                background: inputBgColor,
                color: textColor,
                width: '100%',
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
              background: buttonSecondaryBg,
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
              background: buttonPrimaryBg,
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
              background: buttonSuccessBg,
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
              value: new Set(dataFiltrada.map((r) => r.codigo)).size,
              color: 'var(--app-brand-text)',
            },
            {
              label: 'Movimientos',
              value: dataFiltrada.length,
              color: 'var(--app-text-muted)',
            },
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
                background:
                  theme === 'dark' ? '#2A2A2A' : 'var(--app-surface-alt)',
                borderRadius: 8,
                padding: '6px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, color: s.color }}>{s.value}</div>
              <div
                style={{ fontSize: '0.72rem', color: 'var(--app-text-subtle)' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {dataFiltrada.length === 0 ? (
          <div
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              color: secondaryTextColor,
            }}
          >
            No se encontraron movimientos de repuestos.
          </div>
        ) : (
          <>
            {/* Tabla completa (desktop / pantallas medianas en adelante) */}
            <div className="hidden md:block" style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.8rem',
                }}
              >
                <thead>
                  <tr
                    style={{ background: theadBgColor, color: theadTextColor }}
                  >
                    {[
                      'CÓDIGO',
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
                          padding: '0.4rem 0.5rem',
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
                        ? saldoInicialBg
                        : item.movimiento === 'ENTRADA'
                          ? i % 2 === 0
                            ? entradaBg1
                            : entradaBg2
                          : i % 2 === 0
                            ? salidaBg1
                            : salidaBg2;
                    return (
                      <tr key={i} style={{ background: rowBg }}>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            color: 'var(--app-text-subtle)',
                          }}
                        >
                          {item.codigo}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            fontWeight: 500,
                            color: textColor,
                          }}
                        >
                          {item.producto}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>
                          <TipoBadge tipo={item.movimiento} theme={theme} />
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {fmtDate(item.fecha)}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            fontSize: '0.82rem',
                            color: secondaryTextColor,
                          }}
                        >
                          {item.documento}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            fontSize: '0.82rem',
                            color: secondaryTextColor,
                            maxWidth: 120,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.detalle}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            fontSize: '0.82rem',
                            color: secondaryTextColor,
                          }}
                        >
                          {item.unidad || '—'}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'right',
                            color: successColor,
                            fontWeight: item.ingresos > 0 ? 600 : undefined,
                          }}
                        >
                          {item.ingresos > 0 ? fmtNum(item.ingresos) : '—'}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'right',
                            color: errorColor,
                            fontWeight: item.salidas > 0 ? 600 : undefined,
                          }}
                        >
                          {item.salidas > 0 ? fmtNum(item.salidas) : '—'}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: textColor,
                          }}
                        >
                          {fmtNum(item.saldo)}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'right',
                            color: textColor,
                          }}
                        >
                          {fmtNum(item.costoBs)}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'right',
                            color: successColor,
                          }}
                        >
                          {item.ingresosValBs > 0
                            ? fmtNum(item.ingresosValBs)
                            : '—'}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'right',
                            color: errorColor,
                          }}
                        >
                          {item.salidasValBs > 0
                            ? fmtNum(item.salidasValBs)
                            : '—'}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: textColor,
                          }}
                        >
                          {fmtNum(item.saldoValBs)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tarjetas (mobile) — misma información, reorganizada en vertical
                en vez de forzar scroll horizontal por 14 columnas angostas. */}
            <div className="md:hidden space-y-2">
              {dataFiltrada.map((item, i) => {
                const rowBg =
                  item.movimiento === 'SALDO INICIAL'
                    ? saldoInicialBg
                    : item.movimiento === 'ENTRADA'
                      ? i % 2 === 0
                        ? entradaBg1
                        : entradaBg2
                      : i % 2 === 0
                        ? salidaBg1
                        : salidaBg2;
                return (
                  <div
                    key={i}
                    style={{
                      background: rowBg,
                      borderRadius: 10,
                      border: `1px solid ${inputBorderColor}`,
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: textColor,
                            fontSize: '0.85rem',
                          }}
                        >
                          {item.producto}
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--app-text-subtle)',
                          }}
                        >
                          {item.codigo}
                        </div>
                      </div>
                      <TipoBadge tipo={item.movimiento} theme={theme} />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                        fontSize: '0.76rem',
                        color: secondaryTextColor,
                        marginTop: 6,
                      }}
                    >
                      <span>{fmtDate(item.fecha)}</span>
                      <span>{item.documento}</span>
                    </div>

                    {item.detalle && (
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: secondaryTextColor,
                          marginTop: 4,
                        }}
                      >
                        {item.detalle}
                      </div>
                    )}

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(70px, 1fr))',
                        gap: 6,
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: `1px dashed ${inputBorderColor}`,
                        textAlign: 'center',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '0.66rem',
                            color: 'var(--app-text-subtle)',
                          }}
                        >
                          Ingresos
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: successColor,
                            fontWeight: item.ingresos > 0 ? 600 : undefined,
                          }}
                        >
                          {item.ingresos > 0 ? fmtNum(item.ingresos) : '—'}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.66rem',
                            color: 'var(--app-text-subtle)',
                          }}
                        >
                          Salidas
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: errorColor,
                            fontWeight: item.salidas > 0 ? 600 : undefined,
                          }}
                        >
                          {item.salidas > 0 ? fmtNum(item.salidas) : '—'}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.66rem',
                            color: 'var(--app-text-subtle)',
                          }}
                        >
                          Saldo ({item.unidad || 'u.'})
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: textColor,
                          }}
                        >
                          {fmtNum(item.saldo)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(90px, 1fr))',
                        gap: 6,
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: `1px dashed ${inputBorderColor}`,
                        textAlign: 'center',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '0.66rem',
                            color: 'var(--app-text-subtle)',
                          }}
                        >
                          Costo Unit. Bs
                        </div>
                        <div style={{ fontSize: '0.8rem', color: textColor }}>
                          {fmtNum(item.costoBs)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.66rem',
                            color: 'var(--app-text-subtle)',
                          }}
                        >
                          Ing. Val. Bs
                        </div>
                        <div
                          style={{ fontSize: '0.8rem', color: successColor }}
                        >
                          {item.ingresosValBs > 0
                            ? fmtNum(item.ingresosValBs)
                            : '—'}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.66rem',
                            color: 'var(--app-text-subtle)',
                          }}
                        >
                          Sal. Val. Bs
                        </div>
                        <div style={{ fontSize: '0.8rem', color: errorColor }}>
                          {item.salidasValBs > 0
                            ? fmtNum(item.salidasValBs)
                            : '—'}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.66rem',
                            color: 'var(--app-text-subtle)',
                          }}
                        >
                          Saldo Val. Bs
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: textColor,
                          }}
                        >
                          {fmtNum(item.saldoValBs)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
