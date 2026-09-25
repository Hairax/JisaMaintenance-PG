import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { API_URL } from '../../shared/config/api';
import { exportStyledExcel } from '../../shared/utils/accountingExcel';
import {
  AlcanceExport,
  ExportContabilidadModal,
} from '../../shared/components/ExportContabilidadModal';
import { cargarFiltroContable } from '../../shared/utils/contableFilter';

const API = API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface SalidaDetalle {
  id: number;
  salidaId: number;
  tipoProducto: 'repuesto' | 'repuesto-maquina';
  productoId: number;
  repuestoId?: number | null;
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

interface Salida {
  id: number;
  nroSalida: string;
  usuarioId: number;
  otId: number;
  fecha: string;
  observacion: string;
  almacen: string;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  detalles: SalidaDetalle[];
  createdAt: string;
}

interface OtInfo {
  id: number;
  costCenter?: { id: number; name?: string };
  centroCosto?: { id: number; nombre?: string };
  departamento?: { id: number; nombre?: string };
  objeto?: { id: number; nombre?: string };
}

interface UsuarioInfo {
  id: number;
  name?: string;
  lastName?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', {
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

const ESTADO_STYLE: Record<string, { bg: string; color: string }> = {
  completada: { bg: '#D4EDDA', color: '#155724' },
  pendiente: { bg: '#FFF3CD', color: '#856404' },
  cancelada: { bg: '#F8D7DA', color: '#721C24' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ConsumoMaterialesPage() {
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [expandido, setExpandido] = useState<number | null>(null);
  const [otsMap, setOtsMap] = useState<Record<number, OtInfo>>({});
  const [usuariosMap, setUsuariosMap] = useState<Record<number, UsuarioInfo>>(
    {},
  );
  const [modalExport, setModalExport] = useState(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resSalidas, resOts, resUsers] = await Promise.all([
        fetch(`${API}/salidas`),
        fetch(`${API}/ots`),
        fetch(`${API}/users`),
      ]);
      if (!resSalidas.ok) throw new Error(`Error ${resSalidas.status}`);
      const data: Salida[] = await resSalidas.json();
      setSalidas(Array.isArray(data) ? data : []);

      const ots: OtInfo[] = resOts.ok ? await resOts.json() : [];
      setOtsMap(
        Object.fromEntries(
          (Array.isArray(ots) ? ots : []).map((o) => [o.id, o]),
        ),
      );

      const users: UsuarioInfo[] = resUsers.ok ? await resUsers.json() : [];
      setUsuariosMap(
        Object.fromEntries(
          (Array.isArray(users) ? users : []).map((u) => [u.id, u]),
        ),
      );
    } catch (err) {
      console.error(err);
      setError(
        'Error al cargar los datos. Verifique la conexión con el servidor.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const dataFiltrada = useMemo(
    () =>
      salidas.filter((s) => {
        const fechaStr = s.fecha ? s.fecha.slice(0, 10) : '';
        const matchFiltro =
          !filtro ||
          s.nroSalida?.toLowerCase().includes(filtro.toLowerCase()) ||
          s.almacen?.toLowerCase().includes(filtro.toLowerCase()) ||
          s.observacion?.toLowerCase().includes(filtro.toLowerCase()) ||
          (s.detalles ?? []).some((d) =>
            d.nombre?.toLowerCase().includes(filtro.toLowerCase()),
          );
        const matchEstado =
          filtroEstado === 'todos' || s.estado === filtroEstado;
        const matchInicio = !fechaInicio || fechaStr >= fechaInicio;
        const matchFin = !fechaFin || fechaStr <= fechaFin;
        return matchFiltro && matchEstado && matchInicio && matchFin;
      }),
    [salidas, filtro, filtroEstado, fechaInicio, fechaFin],
  );

  const exportarExcel = () => {
    const filas: Record<string, unknown>[] = [];
    for (const s of dataFiltrada) {
      const base = {
        'N° Salida': s.nroSalida || `#${s.id}`,
        Fecha: fmtDate(s.fecha),
        'OT #': s.otId ? `#${s.otId}` : '—',
        Almacén: s.almacen || '—',
        Estado: s.estado,
        Observación: s.observacion || '',
        'Subtotal Bs': Number(s.subtotal).toFixed(2),
        'Descuento Bs': Number(s.descuentoTotal).toFixed(2),
        'Total Bs': Number(s.total).toFixed(2),
      };
      if ((s.detalles ?? []).length === 0) {
        filas.push({
          ...base,
          Material: '',
          Código: '',
          Tipo: '',
          Cantidad: '',
          'U.M.': '',
          'P. Unit. Bs': '',
          'Subtotal Det. Bs': '',
        });
      } else {
        for (const d of s.detalles) {
          filas.push({
            ...base,
            Material: d.nombre,
            Código: d.codigo || '',
            Tipo: d.tipoProducto,
            Cantidad: Number(d.cantidad),
            'U.M.': d.unidadMedida,
            'P. Unit. Bs': Number(d.precioUnitario).toFixed(2),
            'Subtotal Det. Bs': Number(d.subtotal).toFixed(2),
          });
        }
      }
    }
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Consumo');
    XLSX.writeFile(libro, 'reporte_consumo.xlsx');
  };

  // Export para contabilidad: columnas exactas de Otras_Salidas.xlsx, una
  // fila por cada línea de detalle. 'Tipo (produc/promo/muestra/merma)'
  // queda vacía a propósito — el sistema no distingue eso hoy (solo
  // 'repuesto' vs 'repuesto-maquina', que es otra clasificación).
  // Con alcance 'contables' se omiten las líneas de repuestos no contables.
  const exportarContabilidad = async (alcance: AlcanceExport) => {
    const esContable =
      alcance === 'contables' ? await cargarFiltroContable() : () => true;
    const headers = [
      'codigo',
      'Fecha',
      'Responsable',
      'Almacen',
      'Tipo (produc/promo/muestra/merma)',
      'Cod. producto',
      'Nom. producto',
      'Cantidad',
      'Centro Costo',
      'Departamento',
      'Objeto',
    ];
    const columnWidths = [
      6.71, 6.14, 12.14, 8.43, 34.14, 13, 13.86, 8.71, 11.71, 13.29, 6.71,
    ];

    const nombreUsuario = (id: number) => {
      const u = usuariosMap[id];
      return u ? `${u.name ?? ''} ${u.lastName ?? ''}`.trim() : '';
    };

    const rows: (string | number)[][] = [];
    for (const s of dataFiltrada) {
      const ot = otsMap[s.otId];
      const centroCosto = ot?.costCenter?.name || ot?.centroCosto?.nombre || '';
      const departamento = ot?.departamento?.nombre || '';
      const objeto = ot?.objeto?.nombre || '';

      const lineas = (s.detalles ?? []).filter((d) => esContable(d.repuestoId));
      // Salida cuyas líneas eran todas no contables: no aporta nada al export.
      if (lineas.length === 0 && (s.detalles ?? []).length > 0) continue;
      const detalles =
        lineas.length === 0
          ? [{ codigo: '', nombre: '', cantidad: 0 }]
          : lineas;

      for (const d of detalles) {
        rows.push([
          s.nroSalida || '',
          fmtDate(s.fecha),
          nombreUsuario(s.usuarioId),
          s.almacen || '',
          '', // Tipo (produc/promo/muestra/merma) — sin dato
          d.codigo || '',
          d.nombre,
          Number(d.cantidad) || 0,
          centroCosto,
          departamento,
          objeto,
        ]);
      }
    }

    await exportStyledExcel({
      filename: 'salidas_contabilidad.xlsx',
      sheetName: 'Hoja1',
      headers,
      columnWidths,
      rows,
    });
  };

  if (loading)
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--app-text-subtle)',
        }}
      >
        Cargando consumos...
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
    <div
      style={{
        padding: 'clamp(1rem, 4vw, 2rem)',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: 'var(--app-surface)',
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
          }}
        >
          Consumo de Materiales e Insumos por Periodo
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
            placeholder="Filtrar por material, almacén o N° salida..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid var(--app-border)',
              minWidth: 220,
              flex: 1,
            }}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid var(--app-border)',
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="completada">Completada</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--app-border)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--app-border)',
              }}
            />
          </div>
          <button
            onClick={() => {
              setFiltro('');
              setFiltroEstado('todos');
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
          <button
            onClick={() => setModalExport(true)}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#6A5ACD',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Exportar para Contabilidad
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
              label: 'Salidas',
              value: dataFiltrada.length,
              color: 'var(--app-brand-text)',
            },
            {
              label: 'Ítems',
              value: dataFiltrada.reduce(
                (s, r) => s + (r.detalles?.length ?? 0),
                0,
              ),
              color: 'var(--app-text-muted)',
            },
            {
              label: 'Total consumo',
              value: `Bs ${fmtNum(dataFiltrada.reduce((s, r) => s + Number(r.total), 0))}`,
              color: '#721C24',
            },
            {
              label: 'Completadas',
              value: dataFiltrada.filter((r) => r.estado === 'completada')
                .length,
              color: '#155724',
            },
            {
              label: 'Pendientes',
              value: dataFiltrada.filter((r) => r.estado === 'pendiente')
                .length,
              color: '#856404',
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: 'var(--app-surface-alt)',
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
              <tr style={{ background: 'var(--app-head-bg)' }}>
                <th style={{ padding: '0.65rem 0.75rem', width: 28 }} />
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
                  N° Salida
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  OT #
                </th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>
                  Almacén
                </th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>
                  Estado
                </th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>
                  Observaciones
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
                      color: 'var(--app-brand-accent)',
                    }}
                  >
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
              {dataFiltrada.map((s, i) => {
                const isExp = expandido === s.id;
                const estadoStyle = ESTADO_STYLE[s.estado] ?? {
                  bg: 'var(--app-surface-alt)',
                  color: 'var(--app-text-muted)',
                };
                return (
                  <>
                    <tr
                      key={s.id}
                      style={{
                        background:
                          i % 2 === 0
                            ? 'var(--app-surface)'
                            : 'var(--app-surface-alt)',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandido(isExp ? null : s.id)}
                    >
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'center',
                          color: 'var(--app-text-subtle)',
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
                        {fmtDate(s.fecha)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontWeight: 600,
                          color: 'var(--app-brand-text)',
                        }}
                      >
                        {s.nroSalida || `#${s.id}`}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--app-text-muted)',
                        }}
                      >
                        {s.otId ? `#${s.otId}` : '—'}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        {s.almacen || '—'}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: estadoStyle.bg,
                            color: estadoStyle.color,
                          }}
                        >
                          {s.estado}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--app-text-muted)',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.observacion || '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'right',
                        }}
                      >
                        {fmtNum(Number(s.subtotal))}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'right',
                          color: '#721C24',
                        }}
                      >
                        {Number(s.descuentoTotal) > 0
                          ? fmtNum(Number(s.descuentoTotal))
                          : '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: '#721C24',
                        }}
                      >
                        {fmtNum(Number(s.total))}
                      </td>
                    </tr>
                    {isExp && (
                      <tr
                        key={`det-${s.id}`}
                        style={{ background: 'var(--app-surface-soft)' }}
                      >
                        <td
                          colSpan={10}
                          style={{ padding: '0 1rem 1rem 2.5rem' }}
                        >
                          {(s.detalles ?? []).length === 0 ? (
                            <p
                              style={{
                                color: 'var(--app-text-subtle)',
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
                                <tr
                                  style={{
                                    background: 'var(--app-surface-warm)',
                                  }}
                                >
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
                                {s.detalles.map((d, di) => (
                                  <tr
                                    key={di}
                                    style={{
                                      background:
                                        di % 2 === 0
                                          ? 'var(--app-surface)'
                                          : 'var(--app-surface-warm)',
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
                                        color: 'var(--app-text-subtle)',
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
      <ExportContabilidadModal
        open={modalExport}
        onClose={() => setModalExport(false)}
        onSelect={(alcance) => {
          setModalExport(false);
          exportarContabilidad(alcance).catch((err) => {
            console.error(err);
            setError('Error al generar el Excel para contabilidad.');
          });
        }}
      />
    </div>
  );
}
