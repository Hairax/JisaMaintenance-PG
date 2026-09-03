import React, { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { minutosTrabajados, costoManoObra } from '../../shared/utils/laborCost';
import { API_URL } from '../../shared/config/api';

const API = API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Usuario {
  id: number;
  name: string;
  lastName: string;
  hora$?: number | null;
  minutos$?: number | null;
}

interface InformeDetalle {
  id: number;
  informeId: number;
  otId: number;
  observaciones?: string;
  horaInicio: string;
  horaFinalización: string;
  createdAt: string;
}

interface Informe {
  id: number;
  userId: number;
  detalles: InformeDetalle[];
  createdAt: string;
}

interface SalidaDetalle {
  tipoProducto: string;
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
  subtotal: number;
  descuentoTotal: number;
  total: number;
  estado: string;
  detalles: SalidaDetalle[];
}

interface OT {
  id: number;
  descripcionTarea: string;
  estado: string;
  fechaHora: string;
  fechaCreacion: string;
  tiempoEstimado?: number;
  tipoCambio: number;
  tipoEjecucion?: string;
  tecnicos?: number[];
  tipoOT?: { nombre?: string; name?: string };
  maquina?: { nombre?: string; name?: string };
  costCenter?: { nombre?: string; name?: string };
  proceso?: { nombre?: string; name?: string };
  departamento?: { nombre?: string; name?: string };
  objeto?: { nombre?: string; name?: string };
  supervisor?: { name?: string; lastName?: string };
}

// ── Computed row type ─────────────────────────────────────────────────────────

interface ManoObraRow {
  tecnicoNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  horas: number;
  costo: number;
  observaciones?: string;
}

interface OTReportRow {
  ot: OT;
  manoObra: ManoObraRow[];
  totalHoras: number;
  totalManoObra: number;
  salidas: Salida[];
  totalMateriales: number;
  costoTotal: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtHours = (h: number) => {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
};

const fmtDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const fmtCurrency = (n: number) =>
  n.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getName = (obj?: { nombre?: string; name?: string }) =>
  obj?.nombre ?? obj?.name ?? '—';

const ESTADO_COLORS: Record<string, { bg: string; color: string }> = {
  Abierta: { bg: '#E3F2FD', color: '#1565C0' },
  'En Progreso Técnico': { bg: '#FFF3E0', color: '#E65100' },
  'En Progreso Almacén': { bg: '#F3E5F5', color: '#6A1B9A' },
  Cerrada: { bg: '#E8F5E9', color: '#2E7D32' },
};

const estadoBadge = (estado: string) => {
  const c = ESTADO_COLORS[estado] ?? { bg: '#F5F5F5', color: '#555' };
  return (
    <span
      style={{
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: '0.78rem',
        fontWeight: 600,
        background: c.bg,
        color: c.color,
      }}
    >
      {estado}
    </span>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CostosOrdenesTrabajoPage() {
  const [rows, setRows] = useState<OTReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroDesc, setFiltroDesc] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandTab, setExpandTab] = useState<Record<number, 'mano' | 'mat'>>(
    {},
  );

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resOTs, resInformes, resSalidas, resUsers] = await Promise.all([
        fetch(`${API}/ots`),
        fetch(`${API}/informes`),
        fetch(`${API}/salidas`),
        fetch(`${API}/users`),
      ]);

      const [ots, informes, salidas, users] = (await Promise.all([
        resOTs.ok ? resOTs.json() : [],
        resInformes.ok ? resInformes.json() : [],
        resSalidas.ok ? resSalidas.json() : [],
        resUsers.ok ? resUsers.json() : [],
      ])) as [OT[], Informe[], Salida[], Usuario[]];

      const userMap: Record<number, Usuario> = {};
      for (const u of Array.isArray(users) ? users : []) {
        userMap[u.id] = u;
      }
      const userNombre = (id: number) => {
        const u = userMap[id];
        return u ? `${u.name} ${u.lastName}`.trim() : `Técnico #${id}`;
      };

      const reportRows: OTReportRow[] = (Array.isArray(ots) ? ots : []).map(
        (ot) => {
          // --- Mano de obra: extraer detalles de informes para esta OT ---
          const manoObra: ManoObraRow[] = [];
          for (const inf of Array.isArray(informes) ? informes : []) {
            for (const det of inf.detalles ?? []) {
              if (Number(det.otId) === ot.id) {
                const minutos = minutosTrabajados(
                  det.horaInicio,
                  det['horaFinalización'],
                );
                manoObra.push({
                  tecnicoNombre: userNombre(inf.userId),
                  fecha: det.createdAt ?? inf.createdAt,
                  horaInicio: det.horaInicio,
                  horaFin: det['horaFinalización'],
                  horas: minutos / 60,
                  costo: costoManoObra(userMap[inf.userId], minutos),
                  observaciones: det.observaciones,
                });
              }
            }
          }
          const totalHoras = manoObra.reduce((s, r) => s + r.horas, 0);
          const totalManoObra = manoObra.reduce((s, r) => s + r.costo, 0);

          // --- Materiales: salidas vinculadas a esta OT ---
          const otSalidas = (Array.isArray(salidas) ? salidas : []).filter(
            (s) => Number(s.otId) === ot.id,
          );
          const totalMateriales = otSalidas.reduce(
            (s, sal) => s + Number(sal.total),
            0,
          );

          return {
            ot,
            manoObra,
            totalHoras,
            totalManoObra,
            salidas: otSalidas,
            totalMateriales,
            costoTotal: totalMateriales + totalManoObra,
          };
        },
      );

      setRows(reportRows);
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

  const filtrados = rows.filter((r) => {
    const matchDesc =
      !filtroDesc ||
      r.ot.descripcionTarea.toLowerCase().includes(filtroDesc.toLowerCase()) ||
      String(r.ot.id).includes(filtroDesc);
    const matchEstado =
      filtroEstado === 'todos' || r.ot.estado === filtroEstado;
    return matchDesc && matchEstado;
  });

  const totalHorasGlobal = filtrados.reduce((s, r) => s + r.totalHoras, 0);
  const totalMatsGlobal = filtrados.reduce((s, r) => s + r.totalMateriales, 0);
  const totalManoObraGlobal = filtrados.reduce(
    (s, r) => s + r.totalManoObra,
    0,
  );
  const costoTotalGlobal = filtrados.reduce((s, r) => s + r.costoTotal, 0);

  const toggleExpand = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const getTab = (id: number): 'mano' | 'mat' => expandTab[id] ?? 'mano';

  const setTab = (id: number, tab: 'mano' | 'mat') =>
    setExpandTab((prev) => ({ ...prev, [id]: tab }));

  const exportarExcel = () => {
    const datos: Record<string, unknown>[] = [];
    for (const r of filtrados) {
      datos.push({
        'OT #': r.ot.id,
        Descripción: r.ot.descripcionTarea,
        Estado: r.ot.estado,
        Fecha: fmtDate(r.ot.fechaHora),
        'Tipo Mantenimiento': getName(r.ot.tipoOT),
        Máquina: getName(r.ot.maquina),
        'Centro Costo': getName(r.ot.costCenter),
        Proceso: getName(r.ot.proceso),
        'Tiempo Estimado (h)': r.ot.tiempoEstimado ?? '—',
        'Total Horas Trabajadas': r.totalHoras.toFixed(2),
        'Costo Mano de Obra (Bs)': r.totalManoObra.toFixed(2),
        'Costo Materiales (Bs)': r.totalMateriales.toFixed(2),
        'Costo Total (Bs)': r.costoTotal.toFixed(2),
        Sección: 'Resumen',
      });
      for (const mo of r.manoObra) {
        datos.push({
          'OT #': r.ot.id,
          Descripción: '',
          Estado: '',
          Fecha: fmtDate(mo.fecha),
          'Tipo Mantenimiento': '',
          Máquina: '',
          'Centro Costo': '',
          Proceso: '',
          'Tiempo Estimado (h)': '',
          'Total Horas Trabajadas': mo.horas.toFixed(2),
          'Costo Mano de Obra (Bs)': mo.costo.toFixed(2),
          'Costo Materiales (Bs)': '',
          'Costo Total (Bs)': '',
          Sección: `Mano Obra – ${mo.tecnicoNombre} (${mo.horaInicio} → ${mo.horaFin})`,
        });
      }
      for (const sal of r.salidas) {
        for (const det of sal.detalles ?? []) {
          datos.push({
            'OT #': r.ot.id,
            Descripción: '',
            Estado: '',
            Fecha: fmtDate(sal.fecha),
            'Tipo Mantenimiento': '',
            Máquina: '',
            'Centro Costo': '',
            Proceso: '',
            'Tiempo Estimado (h)': '',
            'Total Horas Trabajadas': '',
            'Costo Mano de Obra (Bs)': '',
            'Costo Materiales (Bs)': Number(det.subtotal).toFixed(2),
            'Costo Total (Bs)': '',
            Sección: `Material – ${det.nombre} (${det.cantidad} ${det.unidadMedida})`,
          });
        }
      }
    }
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Costos OT');
    XLSX.writeFile(libro, 'reporte_costos_ordenes_trabajo.xlsx');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Cargando órdenes de trabajo...
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

  const estados = [
    'todos',
    ...Array.from(new Set(rows.map((r) => r.ot.estado))),
  ];

  return (
    <div
      style={{
        padding: 'clamp(1rem, 4vw, 2rem)',
        maxWidth: 1300,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
          Costos Totales por Órdenes de Trabajo
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
            placeholder="Buscar por descripción o N° OT..."
            value={filtroDesc}
            onChange={(e) => setFiltroDesc(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              flex: 1,
              minWidth: 200,
            }}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
            }}
          >
            {estados.map((e) => (
              <option key={e} value={e}>
                {e === 'todos' ? 'Todos los estados' : e}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setFiltroDesc('');
              setFiltroEstado('todos');
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

        {/* Summary cards */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Total OTs', value: filtrados.length, color: '#5D3312' },
            {
              label: 'Abiertas',
              value: filtrados.filter((r) => r.ot.estado === 'Abierta').length,
              color: '#1565C0',
            },
            {
              label: 'En Progreso',
              value: filtrados.filter((r) =>
                r.ot.estado.startsWith('En Progreso'),
              ).length,
              color: '#E65100',
            },
            {
              label: 'Cerradas',
              value: filtrados.filter((r) => r.ot.estado === 'Cerrada').length,
              color: '#2E7D32',
            },
            {
              label: 'Total Horas',
              value: fmtHours(totalHorasGlobal),
              color: '#6A1B9A',
            },
            {
              label: 'Costo Mano de Obra',
              value: `Bs ${fmtCurrency(totalManoObraGlobal)}`,
              color: '#6A1B9A',
            },
            {
              label: 'Costo Materiales',
              value: `Bs ${fmtCurrency(totalMatsGlobal)}`,
              color: '#D32F2F',
            },
            {
              label: 'Costo Total',
              value: `Bs ${fmtCurrency(costoTotalGlobal)}`,
              color: '#2E7D32',
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: '#F5F5F5',
                borderRadius: 8,
                padding: '0.75rem 1.25rem',
                textAlign: 'center',
                minWidth: 110,
              }}
            >
              <div
                style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#666' }}>
                {s.label}
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
              fontSize: '0.88rem',
            }}
          >
            <thead>
              <tr style={{ background: '#E1CD9B' }}>
                <th style={{ padding: '0.75rem', width: 28 }} />
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>OT #</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Descripción
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Estado
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Máquina
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Tipo Mant.
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                  T. Estimado
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'right',
                    color: '#6A1B9A',
                  }}
                >
                  Horas Trabajadas
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'right',
                    color: '#D32F2F',
                  }}
                >
                  Costo Mat. (Bs)
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'right',
                    color: '#2E7D32',
                  }}
                >
                  Costo Total (Bs)
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
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
              {filtrados.map((r, idx) => {
                const isExpanded = expandedId === r.ot.id;
                const tab = getTab(r.ot.id);
                return (
                  <React.Fragment key={r.ot.id}>
                    <tr
                      style={{
                        background: idx % 2 === 0 ? '#fff' : '#F5F5F5',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleExpand(r.ot.id)}
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
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                        #{r.ot.id}
                      </td>
                      <td style={{ padding: '0.75rem', maxWidth: 260 }}>
                        {r.ot.descripcionTarea}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {estadoBadge(r.ot.estado)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {fmtDate(r.ot.fechaHora)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {getName(r.ot.maquina)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {getName(r.ot.tipoOT)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {r.ot.tiempoEstimado != null
                          ? `${r.ot.tiempoEstimado}h`
                          : '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: '#6A1B9A',
                        }}
                      >
                        {r.totalHoras > 0 ? fmtHours(r.totalHoras) : '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: '#D32F2F',
                        }}
                      >
                        {r.totalMateriales > 0
                          ? fmtCurrency(r.totalMateriales)
                          : '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: '#2E7D32',
                        }}
                      >
                        {r.costoTotal > 0 ? fmtCurrency(r.costoTotal) : '—'}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={11}
                          style={{ padding: 0, background: '#F9F6EE' }}
                        >
                          <div style={{ padding: '1.25rem 2rem 1.5rem' }}>
                            {/* OT info header */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '0.5rem 1.5rem',
                                marginBottom: '1.25rem',
                                padding: '0.75rem 1rem',
                                background: '#fff',
                                borderRadius: 8,
                                border: '1px solid #E1CD9B',
                              }}
                            >
                              {[
                                ['Centro de Costo', getName(r.ot.costCenter)],
                                ['Proceso', getName(r.ot.proceso)],
                                ['Departamento', getName(r.ot.departamento)],
                                ['Objeto', getName(r.ot.objeto)],
                                ['Tipo Ejecución', r.ot.tipoEjecucion ?? '—'],
                                ['Tipo Cambio', `Bs ${r.ot.tipoCambio}`],
                                [
                                  'Supervisor',
                                  r.ot.supervisor
                                    ? `${r.ot.supervisor.name ?? ''} ${r.ot.supervisor.lastName ?? ''}`.trim()
                                    : '—',
                                ],
                                [
                                  'Técnicos asignados',
                                  (r.ot.tecnicos ?? []).length > 0
                                    ? (r.ot.tecnicos ?? []).join(', ')
                                    : '—',
                                ],
                                ['Fecha creación', fmtDate(r.ot.fechaCreacion)],
                              ].map(([label, val]) => (
                                <div key={label}>
                                  <div
                                    style={{
                                      fontSize: '0.72rem',
                                      color: '#888',
                                      marginBottom: 2,
                                    }}
                                  >
                                    {label}
                                  </div>
                                  <div
                                    style={{
                                      fontWeight: 500,
                                      fontSize: '0.85rem',
                                    }}
                                  >
                                    {val}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Tabs */}
                            <div
                              style={{
                                display: 'flex',
                                gap: 8,
                                marginBottom: 12,
                              }}
                            >
                              {(['mano', 'mat'] as const).map((t) => (
                                <button
                                  key={t}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTab(r.ot.id, t);
                                  }}
                                  style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: 8,
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    background:
                                      tab === t ? '#5D3312' : '#E1CD9B',
                                    color: tab === t ? '#fff' : '#5D3312',
                                  }}
                                >
                                  {t === 'mano'
                                    ? `Mano de Obra (${r.manoObra.length} registros · ${fmtHours(r.totalHoras)})`
                                    : `Materiales / Salidas (${r.salidas.length}) · Bs ${fmtCurrency(r.totalMateriales)}`}
                                </button>
                              ))}
                            </div>

                            {/* Tab: Mano de Obra */}
                            {tab === 'mano' && (
                              <table
                                style={{
                                  width: '100%',
                                  borderCollapse: 'collapse',
                                  fontSize: '0.84rem',
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
                                      Técnico
                                    </th>
                                    <th
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'left',
                                      }}
                                    >
                                      Fecha Registro
                                    </th>
                                    <th
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'left',
                                      }}
                                    >
                                      Hora Inicio
                                    </th>
                                    <th
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'left',
                                      }}
                                    >
                                      Hora Fin
                                    </th>
                                    <th
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                      }}
                                    >
                                      Horas
                                    </th>
                                    <th
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                      }}
                                    >
                                      Costo (Bs)
                                    </th>
                                    <th
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'left',
                                      }}
                                    >
                                      Observaciones
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {r.manoObra.length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={7}
                                        style={{
                                          padding: '0.75rem',
                                          textAlign: 'center',
                                          color: '#999',
                                        }}
                                      >
                                        Sin registros de trabajo aún.
                                      </td>
                                    </tr>
                                  )}
                                  {r.manoObra.map((mo, i) => (
                                    <tr
                                      key={i}
                                      style={{
                                        background:
                                          i % 2 === 0 ? '#fff' : '#F9F6EE',
                                      }}
                                    >
                                      <td
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          fontWeight: 500,
                                        }}
                                      >
                                        {mo.tecnicoNombre}
                                      </td>
                                      <td style={{ padding: '0.5rem 0.75rem' }}>
                                        {fmtDate(mo.fecha)}
                                      </td>
                                      <td style={{ padding: '0.5rem 0.75rem' }}>
                                        {mo.horaInicio}
                                      </td>
                                      <td style={{ padding: '0.5rem 0.75rem' }}>
                                        {mo.horaFin}
                                      </td>
                                      <td
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          textAlign: 'right',
                                          fontWeight: 600,
                                          color: '#6A1B9A',
                                        }}
                                      >
                                        {fmtHours(mo.horas)}
                                      </td>
                                      <td
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          textAlign: 'right',
                                          fontWeight: 600,
                                          color: '#2E7D32',
                                        }}
                                      >
                                        {fmtCurrency(mo.costo)}
                                      </td>
                                      <td
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          color: '#666',
                                        }}
                                      >
                                        {mo.observaciones ?? '—'}
                                      </td>
                                    </tr>
                                  ))}
                                  {r.manoObra.length > 0 && (
                                    <tr
                                      style={{
                                        background: '#EDE7F6',
                                        fontWeight: 700,
                                      }}
                                    >
                                      <td
                                        colSpan={4}
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          textAlign: 'right',
                                        }}
                                      >
                                        Totales:
                                      </td>
                                      <td
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          textAlign: 'right',
                                          color: '#6A1B9A',
                                        }}
                                      >
                                        {fmtHours(r.totalHoras)}
                                      </td>
                                      <td
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          textAlign: 'right',
                                          color: '#2E7D32',
                                        }}
                                      >
                                        {fmtCurrency(r.totalManoObra)}
                                      </td>
                                      <td />
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            )}

                            {/* Tab: Materiales */}
                            {tab === 'mat' && (
                              <>
                                {r.salidas.length === 0 && (
                                  <p
                                    style={{
                                      color: '#999',
                                      padding: '0.5rem 0',
                                    }}
                                  >
                                    Sin salidas de almacén registradas para esta
                                    OT.
                                  </p>
                                )}
                                {r.salidas.map((sal) => (
                                  <div
                                    key={sal.id}
                                    style={{ marginBottom: 16 }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        gap: 24,
                                        padding: '0.5rem 0.75rem',
                                        background: '#fff',
                                        borderRadius: 6,
                                        marginBottom: 4,
                                        border: '1px solid #ddd',
                                        fontSize: '0.83rem',
                                      }}
                                    >
                                      <span>
                                        <strong>Salida:</strong>{' '}
                                        {sal.nroSalida || `#${sal.id}`}
                                      </span>
                                      <span>
                                        <strong>Fecha:</strong>{' '}
                                        {fmtDate(sal.fecha)}
                                      </span>
                                      <span>
                                        <strong>Estado:</strong> {sal.estado}
                                      </span>
                                      <span>
                                        <strong>Total:</strong> Bs{' '}
                                        {fmtCurrency(Number(sal.total))}
                                      </span>
                                      {sal.observacion && (
                                        <span>
                                          <strong>Obs:</strong>{' '}
                                          {sal.observacion}
                                        </span>
                                      )}
                                    </div>
                                    <table
                                      style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '0.83rem',
                                      }}
                                    >
                                      <thead>
                                        <tr style={{ background: '#E1CD9B' }}>
                                          <th
                                            style={{
                                              padding: '0.4rem 0.75rem',
                                              textAlign: 'left',
                                            }}
                                          >
                                            Producto
                                          </th>
                                          <th
                                            style={{
                                              padding: '0.4rem 0.75rem',
                                              textAlign: 'left',
                                            }}
                                          >
                                            Tipo
                                          </th>
                                          <th
                                            style={{
                                              padding: '0.4rem 0.75rem',
                                              textAlign: 'right',
                                            }}
                                          >
                                            Cantidad
                                          </th>
                                          <th
                                            style={{
                                              padding: '0.4rem 0.75rem',
                                              textAlign: 'left',
                                            }}
                                          >
                                            U.M.
                                          </th>
                                          <th
                                            style={{
                                              padding: '0.4rem 0.75rem',
                                              textAlign: 'right',
                                            }}
                                          >
                                            Precio Unit.
                                          </th>
                                          <th
                                            style={{
                                              padding: '0.4rem 0.75rem',
                                              textAlign: 'right',
                                            }}
                                          >
                                            Subtotal (Bs)
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(sal.detalles ?? []).map((det, di) => (
                                          <tr
                                            key={di}
                                            style={{
                                              background:
                                                di % 2 === 0
                                                  ? '#fff'
                                                  : '#F9F6EE',
                                            }}
                                          >
                                            <td
                                              style={{
                                                padding: '0.4rem 0.75rem',
                                              }}
                                            >
                                              {det.nombre}
                                            </td>
                                            <td
                                              style={{
                                                padding: '0.4rem 0.75rem',
                                              }}
                                            >
                                              <span
                                                style={{
                                                  padding: '2px 6px',
                                                  borderRadius: 8,
                                                  fontSize: '0.75rem',
                                                  background:
                                                    det.tipoProducto ===
                                                    'repuesto'
                                                      ? '#E3F2FD'
                                                      : '#F3E5F5',
                                                  color:
                                                    det.tipoProducto ===
                                                    'repuesto'
                                                      ? '#1565C0'
                                                      : '#6A1B9A',
                                                }}
                                              >
                                                {det.tipoProducto === 'repuesto'
                                                  ? 'Repuesto'
                                                  : 'Rep. Máq.'}
                                              </span>
                                            </td>
                                            <td
                                              style={{
                                                padding: '0.4rem 0.75rem',
                                                textAlign: 'right',
                                              }}
                                            >
                                              {det.cantidad}
                                            </td>
                                            <td
                                              style={{
                                                padding: '0.4rem 0.75rem',
                                              }}
                                            >
                                              {det.unidadMedida}
                                            </td>
                                            <td
                                              style={{
                                                padding: '0.4rem 0.75rem',
                                                textAlign: 'right',
                                              }}
                                            >
                                              {fmtCurrency(
                                                Number(det.precioUnitario),
                                              )}
                                            </td>
                                            <td
                                              style={{
                                                padding: '0.4rem 0.75rem',
                                                textAlign: 'right',
                                                fontWeight: 600,
                                              }}
                                            >
                                              {fmtCurrency(
                                                Number(det.subtotal),
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ))}
                                {r.salidas.length > 0 && (
                                  <div
                                    style={{
                                      textAlign: 'right',
                                      fontWeight: 700,
                                      color: '#D32F2F',
                                      fontSize: '0.9rem',
                                      paddingTop: 8,
                                    }}
                                  >
                                    Total materiales: Bs{' '}
                                    {fmtCurrency(r.totalMateriales)}
                                  </div>
                                )}
                              </>
                            )}
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
