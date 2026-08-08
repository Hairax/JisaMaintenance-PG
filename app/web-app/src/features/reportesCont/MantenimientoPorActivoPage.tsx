import { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { minutosTrabajados, costoManoObra } from '../../shared/utils/laborCost';

const API = 'http://localhost:3000';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Maquina {
  id: number;
  name: string;
  fabricante: string;
  tipoDeMaquina: string;
  numeroDeSerie: string;
  fechaDeFabricacion: string;
  fechaDeMontaje: string;
  costo: number;
  horasTrabajadas: number;
  centroCosto_id: number;
  proceso_id: number;
  proveedor_id: number;
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
  maquina_id: number;
  tipoOT?: { id: number; nombre?: string; name?: string };
  maquina?: { id: number; nombre?: string; name?: string };
  costCenter?: { id: number; nombre?: string; name?: string };
  proceso?: { id: number; nombre?: string; name?: string };
  departamento?: { id: number; nombre?: string; name?: string };
  objeto?: { id: number; nombre?: string; name?: string };
  supervisor?: { id: number; name?: string; lastName?: string };
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
  total: number;
  estado: string;
  detalles: SalidaDetalle[];
}

interface Usuario {
  id: number;
  name: string;
  lastName: string;
  hora$?: number | null;
  minutos$?: number | null;
}

// ── Computed types ─────────────────────────────────────────────────────────────

interface ManoObraRow {
  tecnicoNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  horas: number;
  costo: number;
  observaciones?: string;
}

interface OTConCostos {
  ot: OT;
  manoObra: ManoObraRow[];
  totalHoras: number;
  totalManoObra: number;
  salidas: Salida[];
  totalMateriales: number;
  costoTotal: number;
}

interface MaquinaRow {
  maquina: Maquina;
  ots: OTConCostos[];
  totalOTs: number;
  totalHoras: number;
  totalManoObra: number;
  totalMateriales: number;
  costoTotal: number;
  otsCerradas: number;
  otsAbiertas: number;
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
        fontSize: '0.75rem',
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

export default function MantenimientoPorActivoPage() {
  const [maquinaRows, setMaquinaRows] = useState<MaquinaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Expanded state: maquinaId → expanded OT id (or null)
  const [expandedMaq, setExpandedMaq] = useState<number | null>(null);
  const [expandedOT, setExpandedOT] = useState<number | null>(null);
  const [otTab, setOtTab] = useState<Record<number, 'mano' | 'mat'>>({});

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resMaq, resOTs, resInformes, resSalidas, resUsers] =
        await Promise.all([
          fetch(`${API}/maquinas`),
          fetch(`${API}/ots`),
          fetch(`${API}/informes`),
          fetch(`${API}/salidas`),
          fetch(`${API}/users`),
        ]);

      const [maquinas, ots, informes, salidas, users] = (await Promise.all([
        resMaq.ok ? resMaq.json() : [],
        resOTs.ok ? resOTs.json() : [],
        resInformes.ok ? resInformes.json() : [],
        resSalidas.ok ? resSalidas.json() : [],
        resUsers.ok ? resUsers.json() : [],
      ])) as [Maquina[], OT[], Informe[], Salida[], Usuario[]];

      const userMap: Record<number, Usuario> = {};
      for (const u of Array.isArray(users) ? users : []) {
        userMap[u.id] = u;
      }
      const userNombre = (id: number) => {
        const u = userMap[id];
        return u ? `${u.name} ${u.lastName}`.trim() : `Técnico #${id}`;
      };

      const buildOTRow = (ot: OT): OTConCostos => {
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

        const otSalidas = (Array.isArray(salidas) ? salidas : []).filter(
          (s) => Number(s.otId) === ot.id,
        );
        const totalHoras = manoObra.reduce((s, r) => s + r.horas, 0);
        const totalManoObra = manoObra.reduce((s, r) => s + r.costo, 0);
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
          costoTotal: totalManoObra + totalMateriales,
        };
      };

      const rows: MaquinaRow[] = (Array.isArray(maquinas) ? maquinas : []).map(
        (maq) => {
          // Match OTs to this machine via maquina_id or maquina.id relation
          const maqOTs = (Array.isArray(ots) ? ots : []).filter(
            (ot) =>
              Number(ot.maquina_id) === maq.id ||
              Number(ot.maquina?.id) === maq.id,
          );

          const otsConCostos = maqOTs.map(buildOTRow);

          return {
            maquina: maq,
            ots: otsConCostos,
            totalOTs: otsConCostos.length,
            totalHoras: otsConCostos.reduce((s, r) => s + r.totalHoras, 0),
            totalManoObra: otsConCostos.reduce(
              (s, r) => s + r.totalManoObra,
              0,
            ),
            totalMateriales: otsConCostos.reduce(
              (s, r) => s + r.totalMateriales,
              0,
            ),
            costoTotal: otsConCostos.reduce((s, r) => s + r.costoTotal, 0),
            otsCerradas: otsConCostos.filter((r) => r.ot.estado === 'Cerrada')
              .length,
            otsAbiertas: otsConCostos.filter((r) => r.ot.estado !== 'Cerrada')
              .length,
          };
        },
      );

      setMaquinaRows(rows);
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

  const tiposDeMaquina = [
    'todos',
    ...Array.from(
      new Set(maquinaRows.map((r) => r.maquina.tipoDeMaquina).filter(Boolean)),
    ),
  ];

  const filtrados = maquinaRows.filter((r) => {
    const matchNombre =
      !filtroNombre ||
      r.maquina.name.toLowerCase().includes(filtroNombre.toLowerCase()) ||
      r.maquina.numeroDeSerie
        ?.toLowerCase()
        .includes(filtroNombre.toLowerCase());
    const matchTipo =
      filtroTipo === 'todos' || r.maquina.tipoDeMaquina === filtroTipo;
    return matchNombre && matchTipo;
  });

  const exportarExcel = () => {
    const datos: Record<string, unknown>[] = [];
    for (const r of filtrados) {
      datos.push({
        Activo: r.maquina.name,
        'N° Serie': r.maquina.numeroDeSerie,
        'Tipo Máquina': r.maquina.tipoDeMaquina,
        Fabricante: r.maquina.fabricante,
        'Fecha Montaje': fmtDate(r.maquina.fechaDeMontaje),
        'Total OTs': r.totalOTs,
        'Horas Trabajadas': r.totalHoras.toFixed(2),
        'Costo Mano de Obra (Bs)': r.totalManoObra.toFixed(2),
        'Costo Materiales (Bs)': r.totalMateriales.toFixed(2),
        'Costo Total (Bs)': r.costoTotal.toFixed(2),
        Sección: 'Resumen Activo',
        'OT #': '',
        'Tipo Mant.': '',
        Estado: '',
        Descripción: '',
        Fecha: '',
        Técnico: '',
        'Horas OT': '',
        Producto: '',
        Cantidad: '',
        'Subtotal (Bs)': '',
      });
      for (const otRow of r.ots) {
        datos.push({
          Activo: '',
          'N° Serie': '',
          'Tipo Máquina': '',
          Fabricante: '',
          'Fecha Montaje': '',
          'Total OTs': '',
          'Horas Trabajadas': '',
          'Costo Mano de Obra (Bs)': '',
          'Costo Materiales (Bs)': '',
          'Costo Total (Bs)': '',
          Sección: 'OT',
          'OT #': `#${otRow.ot.id}`,
          'Tipo Mant.': getName(otRow.ot.tipoOT),
          Estado: otRow.ot.estado,
          Descripción: otRow.ot.descripcionTarea,
          Fecha: fmtDate(otRow.ot.fechaHora),
          Técnico: '',
          'Horas OT': otRow.totalHoras.toFixed(2),
          Producto: '',
          Cantidad: '',
          'Subtotal (Bs)': (
            otRow.totalManoObra + otRow.totalMateriales
          ).toFixed(2),
        });
        for (const mo of otRow.manoObra) {
          datos.push({
            Activo: '',
            'N° Serie': '',
            'Tipo Máquina': '',
            Fabricante: '',
            'Fecha Montaje': '',
            'Total OTs': '',
            'Horas Trabajadas': '',
            'Costo Mano de Obra (Bs)': '',
            'Costo Materiales (Bs)': '',
            'Costo Total (Bs)': '',
            Sección: 'Mano Obra',
            'OT #': `#${otRow.ot.id}`,
            'Tipo Mant.': '',
            Estado: '',
            Descripción: mo.observaciones ?? '',
            Fecha: fmtDate(mo.fecha),
            Técnico: mo.tecnicoNombre,
            'Horas OT': mo.horas.toFixed(2),
            Producto: '',
            Cantidad: '',
            'Subtotal (Bs)': mo.costo.toFixed(2),
          });
        }
        for (const sal of otRow.salidas) {
          for (const det of sal.detalles ?? []) {
            datos.push({
              Activo: '',
              'N° Serie': '',
              'Tipo Máquina': '',
              Fabricante: '',
              'Fecha Montaje': '',
              'Total OTs': '',
              'Horas Trabajadas': '',
              'Costo Mano de Obra (Bs)': '',
              'Costo Materiales (Bs)': '',
              'Costo Total (Bs)': '',
              Sección: 'Material',
              'OT #': `#${otRow.ot.id}`,
              'Tipo Mant.': '',
              Estado: '',
              Descripción: '',
              Fecha: fmtDate(sal.fecha),
              Técnico: '',
              'Horas OT': '',
              Producto: det.nombre,
              Cantidad: `${det.cantidad} ${det.unidadMedida}`,
              'Subtotal (Bs)': Number(det.subtotal).toFixed(2),
            });
          }
        }
      }
    }
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Mantenimiento por Activo');
    XLSX.writeFile(libro, 'reporte_mantenimiento_por_activo.xlsx');
  };

  const getOtTab = (id: number): 'mano' | 'mat' => otTab[id] ?? 'mano';
  const setOtTabFn = (id: number, t: 'mano' | 'mat') =>
    setOtTab((p) => ({ ...p, [id]: t }));

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando datos de activos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={cargarDatos}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#F9FAFB]">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-[#2D3748]">
          Reporte de Mantenimiento por Activo
        </h2>

        {/* Filters */}
        <div className="flex gap-3 items-end mb-5 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre o N° de serie..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="p-2 px-4 border border-gray-200 rounded-lg flex-1 min-w-[200px] focus:ring-2 focus:ring-yellow-400 bg-[#F7FAFC]"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="p-2 px-3 border border-gray-200 rounded-lg bg-[#F7FAFC]"
          >
            {tiposDeMaquina.map((t) => (
              <option key={t} value={t}>
                {t === 'todos' ? 'Todos los tipos' : t}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setFiltroNombre('');
              setFiltroTipo('todos');
            }}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium"
          >
            Limpiar
          </button>
          <button
            onClick={cargarDatos}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium"
          >
            Actualizar
          </button>
          <button
            onClick={exportarExcel}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow"
          >
            Exportar Excel
          </button>
        </div>

        {/* Summary cards */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            {
              label: 'Activos',
              value: filtrados.length,
              color: 'text-[#5D3312]',
            },
            {
              label: 'Total OTs',
              value: filtrados.reduce((s, r) => s + r.totalOTs, 0),
              color: 'text-[#1565C0]',
            },
            {
              label: 'OTs Cerradas',
              value: filtrados.reduce((s, r) => s + r.otsCerradas, 0),
              color: 'text-[#2E7D32]',
            },
            {
              label: 'OTs Abiertas',
              value: filtrados.reduce((s, r) => s + r.otsAbiertas, 0),
              color: 'text-[#E65100]',
            },
            {
              label: 'Horas Totales',
              value: fmtHours(filtrados.reduce((s, r) => s + r.totalHoras, 0)),
              color: 'text-[#6A1B9A]',
            },
            {
              label: 'Costo M.O. Total',
              value: `Bs ${fmtCurrency(filtrados.reduce((s, r) => s + r.totalManoObra, 0))}`,
              color: 'text-[#6A1B9A]',
            },
            {
              label: 'Costo Mat. Total',
              value: `Bs ${fmtCurrency(filtrados.reduce((s, r) => s + r.totalMateriales, 0))}`,
              color: 'text-[#D32F2F]',
            },
            {
              label: 'Costo Total',
              value: `Bs ${fmtCurrency(filtrados.reduce((s, r) => s + r.costoTotal, 0))}`,
              color: 'text-[#2E7D32]',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-gray-100 rounded-lg px-5 py-3 text-center min-w-[110px]"
            >
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Maquina accordion list */}
        {filtrados.length === 0 && (
          <p className="text-center text-yellow-900 p-6">
            No se encontraron activos.
          </p>
        )}

        <div className="space-y-3">
          {filtrados.map((r) => {
            const isMaqExp = expandedMaq === r.maquina.id;
            return (
              <div
                key={r.maquina.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Maquina header row */}
                <div
                  className="flex items-center gap-4 p-4 bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition"
                  onClick={() => {
                    setExpandedMaq(isMaqExp ? null : r.maquina.id);
                    setExpandedOT(null);
                  }}
                >
                  <span className="text-gray-400 w-4 shrink-0">
                    {isMaqExp ? '▼' : '▶'}
                  </span>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <div className="text-xs text-gray-400">Activo</div>
                      <div className="font-bold text-[#2D3748]">
                        {r.maquina.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">
                        Tipo / N° Serie
                      </div>
                      <div className="text-sm">
                        {r.maquina.tipoDeMaquina || '—'} ·{' '}
                        {r.maquina.numeroDeSerie || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Fabricante</div>
                      <div className="text-sm">
                        {r.maquina.fabricante || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Fecha Montaje</div>
                      <div className="text-sm">
                        {fmtDate(r.maquina.fechaDeMontaje)}
                      </div>
                    </div>
                  </div>
                  {/* KPIs */}
                  <div className="flex gap-4 shrink-0 text-center">
                    <div>
                      <div className="text-xs text-gray-400">OTs</div>
                      <div className="font-bold text-blue-700">
                        {r.totalOTs}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Horas</div>
                      <div className="font-bold text-purple-700">
                        {r.totalHoras > 0 ? fmtHours(r.totalHoras) : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Mat. (Bs)</div>
                      <div className="font-bold text-red-700">
                        {r.totalMateriales > 0
                          ? fmtCurrency(r.totalMateriales)
                          : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">
                        Costo Total (Bs)
                      </div>
                      <div className="font-bold text-green-700">
                        {r.costoTotal > 0 ? fmtCurrency(r.costoTotal) : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded: Maquina detail + OT list */}
                {isMaqExp && (
                  <div className="p-5 bg-white border-t border-gray-100">
                    {/* Maquina info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-yellow-50 rounded-xl mb-5 text-sm border border-yellow-200">
                      {[
                        ['Fabricante', r.maquina.fabricante],
                        ['Tipo', r.maquina.tipoDeMaquina],
                        ['N° de Serie', r.maquina.numeroDeSerie],
                        [
                          'Costo Adquisición',
                          `Bs ${fmtCurrency(Number(r.maquina.costo))}`,
                        ],
                        [
                          'Hrs. Trabajadas (reg.)',
                          r.maquina.horasTrabajadas ?? '—',
                        ],
                        [
                          'Fecha Fabricación',
                          fmtDate(r.maquina.fechaDeFabricacion),
                        ],
                        ['Fecha Montaje', fmtDate(r.maquina.fechaDeMontaje)],
                        [
                          'OTs Cerradas / Abiertas',
                          `${r.otsCerradas} / ${r.otsAbiertas}`,
                        ],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div className="text-xs text-gray-400 mb-0.5">
                            {label}
                          </div>
                          <div className="font-semibold text-[#2D3748]">
                            {val}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* OT list for this maquina */}
                    <h4 className="font-semibold text-[#2D3748] mb-3 text-sm">
                      Órdenes de Trabajo ({r.ots.length})
                    </h4>

                    {r.ots.length === 0 && (
                      <p className="text-gray-400 text-sm">
                        Sin órdenes de trabajo registradas para este activo.
                      </p>
                    )}

                    <div className="space-y-2">
                      {r.ots.map((otRow) => {
                        const isOTExp = expandedOT === otRow.ot.id;
                        const tab = getOtTab(otRow.ot.id);
                        return (
                          <div
                            key={otRow.ot.id}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            {/* OT summary row */}
                            <div
                              className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition text-sm"
                              onClick={() =>
                                setExpandedOT(isOTExp ? null : otRow.ot.id)
                              }
                            >
                              <span className="text-gray-400 w-3 shrink-0">
                                {isOTExp ? '▼' : '▶'}
                              </span>
                              <span className="font-bold text-[#5D3312] w-12 shrink-0">
                                #{otRow.ot.id}
                              </span>
                              <span className="flex-1 truncate">
                                {otRow.ot.descripcionTarea}
                              </span>
                              <span className="shrink-0">
                                {estadoBadge(otRow.ot.estado)}
                              </span>
                              <span className="text-gray-400 shrink-0 w-24 text-right">
                                {fmtDate(otRow.ot.fechaHora)}
                              </span>
                              <span className="text-[#6A1B9A] font-semibold shrink-0 w-20 text-right">
                                {otRow.totalHoras > 0
                                  ? fmtHours(otRow.totalHoras)
                                  : '—'}
                              </span>
                              <span className="text-[#D32F2F] font-semibold shrink-0 w-24 text-right">
                                {otRow.totalMateriales > 0
                                  ? `Bs ${fmtCurrency(otRow.totalMateriales)}`
                                  : '—'}
                              </span>
                              <span className="text-[#2E7D32] font-semibold shrink-0 w-24 text-right">
                                {otRow.costoTotal > 0
                                  ? `Bs ${fmtCurrency(otRow.costoTotal)}`
                                  : '—'}
                              </span>
                            </div>

                            {/* OT expanded detail */}
                            {isOTExp && (
                              <div className="p-4 bg-white border-t border-gray-100">
                                {/* OT info */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4 p-3 bg-[#F9F6EE] rounded-lg border border-yellow-100">
                                  {[
                                    [
                                      'Tipo Mantenimiento',
                                      getName(otRow.ot.tipoOT),
                                    ],
                                    [
                                      'Tipo Ejecución',
                                      otRow.ot.tipoEjecucion ?? '—',
                                    ],
                                    [
                                      'Centro de Costo',
                                      getName(otRow.ot.costCenter),
                                    ],
                                    ['Proceso', getName(otRow.ot.proceso)],
                                    [
                                      'Departamento',
                                      getName(otRow.ot.departamento),
                                    ],
                                    ['Objeto', getName(otRow.ot.objeto)],
                                    [
                                      'T. Estimado',
                                      otRow.ot.tiempoEstimado != null
                                        ? `${otRow.ot.tiempoEstimado}h`
                                        : '—',
                                    ],
                                    [
                                      'Supervisor',
                                      otRow.ot.supervisor
                                        ? `${otRow.ot.supervisor.name ?? ''} ${otRow.ot.supervisor.lastName ?? ''}`.trim()
                                        : '—',
                                    ],
                                  ].map(([label, val]) => (
                                    <div key={label}>
                                      <div className="text-gray-400 mb-0.5">
                                        {label}
                                      </div>
                                      <div className="font-semibold text-[#2D3748]">
                                        {val}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 mb-3">
                                  {(['mano', 'mat'] as const).map((t) => (
                                    <button
                                      key={t}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOtTabFn(otRow.ot.id, t);
                                      }}
                                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                                      style={{
                                        background:
                                          tab === t ? '#5D3312' : '#E1CD9B',
                                        color: tab === t ? '#fff' : '#5D3312',
                                        border: 'none',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {t === 'mano'
                                        ? `Mano de Obra (${otRow.manoObra.length} · ${fmtHours(otRow.totalHoras)})`
                                        : `Materiales (${otRow.salidas.length} salidas · Bs ${fmtCurrency(otRow.totalMateriales)})`}
                                    </button>
                                  ))}
                                </div>

                                {/* Tab: Mano de Obra */}
                                {tab === 'mano' && (
                                  <table className="w-full text-xs border-collapse">
                                    <thead>
                                      <tr className="bg-yellow-100">
                                        <th className="p-2 text-left font-semibold text-gray-500">
                                          Técnico
                                        </th>
                                        <th className="p-2 text-left font-semibold text-gray-500">
                                          Fecha
                                        </th>
                                        <th className="p-2 text-left font-semibold text-gray-500">
                                          Inicio
                                        </th>
                                        <th className="p-2 text-left font-semibold text-gray-500">
                                          Fin
                                        </th>
                                        <th className="p-2 text-right font-semibold text-gray-500">
                                          Horas
                                        </th>
                                        <th className="p-2 text-right font-semibold text-gray-500">
                                          Costo (Bs)
                                        </th>
                                        <th className="p-2 text-left font-semibold text-gray-500">
                                          Observaciones
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {otRow.manoObra.length === 0 && (
                                        <tr>
                                          <td
                                            colSpan={7}
                                            className="p-3 text-center text-gray-400"
                                          >
                                            Sin registros de trabajo aún.
                                          </td>
                                        </tr>
                                      )}
                                      {otRow.manoObra.map((mo, i) => (
                                        <tr
                                          key={i}
                                          className={
                                            i % 2 === 0
                                              ? 'bg-white'
                                              : 'bg-gray-50'
                                          }
                                        >
                                          <td className="p-2 font-medium">
                                            {mo.tecnicoNombre}
                                          </td>
                                          <td className="p-2">
                                            {fmtDate(mo.fecha)}
                                          </td>
                                          <td className="p-2">
                                            {mo.horaInicio}
                                          </td>
                                          <td className="p-2">{mo.horaFin}</td>
                                          <td className="p-2 text-right font-bold text-purple-700">
                                            {fmtHours(mo.horas)}
                                          </td>
                                          <td className="p-2 text-right font-bold text-green-700">
                                            {fmtCurrency(mo.costo)}
                                          </td>
                                          <td className="p-2 text-gray-500">
                                            {mo.observaciones ?? '—'}
                                          </td>
                                        </tr>
                                      ))}
                                      {otRow.manoObra.length > 0 && (
                                        <tr className="bg-purple-50 font-bold text-xs">
                                          <td
                                            colSpan={4}
                                            className="p-2 text-right"
                                          >
                                            Totales:
                                          </td>
                                          <td className="p-2 text-right text-purple-700">
                                            {fmtHours(otRow.totalHoras)}
                                          </td>
                                          <td className="p-2 text-right text-green-700">
                                            {fmtCurrency(otRow.totalManoObra)}
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
                                    {otRow.salidas.length === 0 && (
                                      <p className="text-gray-400 text-xs p-2">
                                        Sin salidas de almacén registradas.
                                      </p>
                                    )}
                                    {otRow.salidas.map((sal) => (
                                      <div key={sal.id} className="mb-3">
                                        <div className="flex gap-4 text-xs p-2 bg-gray-50 rounded-t border border-gray-200 font-medium text-gray-600">
                                          <span>
                                            Salida:{' '}
                                            <strong>
                                              {sal.nroSalida || `#${sal.id}`}
                                            </strong>
                                          </span>
                                          <span>
                                            Fecha: {fmtDate(sal.fecha)}
                                          </span>
                                          <span>Estado: {sal.estado}</span>
                                          <span>
                                            Total:{' '}
                                            <strong className="text-red-700">
                                              Bs{' '}
                                              {fmtCurrency(Number(sal.total))}
                                            </strong>
                                          </span>
                                          {sal.observacion && (
                                            <span>Obs: {sal.observacion}</span>
                                          )}
                                        </div>
                                        <table className="w-full text-xs border-collapse border border-t-0 border-gray-200">
                                          <thead>
                                            <tr className="bg-yellow-100">
                                              <th className="p-2 text-left font-semibold text-gray-500">
                                                Producto
                                              </th>
                                              <th className="p-2 text-left font-semibold text-gray-500">
                                                Tipo
                                              </th>
                                              <th className="p-2 text-right font-semibold text-gray-500">
                                                Cantidad
                                              </th>
                                              <th className="p-2 text-left font-semibold text-gray-500">
                                                U.M.
                                              </th>
                                              <th className="p-2 text-right font-semibold text-gray-500">
                                                P. Unit.
                                              </th>
                                              <th className="p-2 text-right font-semibold text-gray-500">
                                                Subtotal (Bs)
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {(sal.detalles ?? []).map(
                                              (det, di) => (
                                                <tr
                                                  key={di}
                                                  className={
                                                    di % 2 === 0
                                                      ? 'bg-white'
                                                      : 'bg-gray-50'
                                                  }
                                                >
                                                  <td className="p-2">
                                                    {det.nombre}
                                                  </td>
                                                  <td className="p-2">
                                                    <span
                                                      style={{
                                                        padding: '1px 6px',
                                                        borderRadius: 8,
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
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                      }}
                                                    >
                                                      {det.tipoProducto ===
                                                      'repuesto'
                                                        ? 'Repuesto'
                                                        : 'Rep. Máq.'}
                                                    </span>
                                                  </td>
                                                  <td className="p-2 text-right">
                                                    {det.cantidad}
                                                  </td>
                                                  <td className="p-2">
                                                    {det.unidadMedida}
                                                  </td>
                                                  <td className="p-2 text-right">
                                                    {fmtCurrency(
                                                      Number(
                                                        det.precioUnitario,
                                                      ),
                                                    )}
                                                  </td>
                                                  <td className="p-2 text-right font-bold">
                                                    {fmtCurrency(
                                                      Number(det.subtotal),
                                                    )}
                                                  </td>
                                                </tr>
                                              ),
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    ))}
                                    {otRow.salidas.length > 0 && (
                                      <div className="text-right text-xs font-bold text-red-700 pt-1">
                                        Total materiales: Bs{' '}
                                        {fmtCurrency(otRow.totalMateriales)}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
