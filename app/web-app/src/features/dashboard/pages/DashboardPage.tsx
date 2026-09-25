import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  useDashboardData,
  type PeriodoFiltro,
} from '../hooks/useDashboardData';
import KpiCard from '../components/KpiCard';
import BiBarChart from '../components/BiBarChart';
import BiPieChart from '../components/BiPieChart';
import BiLineChart from '../components/BiLineChart';
import { useState } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number): string =>
  n.toLocaleString('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const fmtHours = (h: number): string => {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
};

const PERIODOS: { value: PeriodoFiltro; label: string }[] = [
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '12m', label: '12 meses' },
  { value: 'anio', label: 'Este año' },
  { value: 'todo', label: 'Todo' },
];

const ACCESOS_RAPIDOS = [
  { label: 'Disponibilidad', to: '/kpis/disponibilidad', color: '#1565C0' },
  { label: 'TMEF (MTBF)', to: '/kpis/tmef', color: '#6A1B9A' },
  { label: 'TMPR (MTTR)', to: '/kpis/tmpr', color: '#E65100' },
  { label: 'Costo por Activo', to: '/kpis/costo-por-activo', color: '#2E7D32' },
  {
    label: 'Costos por OT',
    to: '/reportes/costos-ordenes-trabajo',
    color: 'var(--app-brand-accent)',
  },
  {
    label: 'Costos de Mantenimiento',
    to: '/reportes/costos',
    color: '#D32F2F',
  },
  {
    label: 'Mantenimiento por Activo',
    to: '/reportes/mantenimiento-activo',
    color: 'var(--app-brand-text)',
  },
];

const diasColor = (dias: number) => {
  if (dias > 14) return { bg: '#FDECEA', color: '#C62828' };
  if (dias > 7) return { bg: '#FFF3E0', color: '#E65100' };
  return { bg: 'var(--app-surface-alt)', color: 'var(--app-text-muted)' };
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('6m');
  const { data, loading, error, recargar } = useDashboardData(periodo);

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Cargando panel gerencial...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={recargar}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary } = data;

  const tendenciaOTs = data.otsPorMes.map((m, i) => ({
    name: m.name,
    creadas: m.value,
    cerradas: data.otsCerradasPorMes[i]?.value ?? 0,
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto bg-[#F9FAFB] dark:bg-[#161616]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D3748] dark:text-gray-100">
            Panel Gerencial de Mantenimiento
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visión general de órdenes de trabajo, costos y desempeño
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#3A3A3A] rounded-lg overflow-hidden">
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                className="px-3 py-2 text-xs font-medium transition"
                style={{
                  background: periodo === p.value ? '#5D3312' : 'transparent',
                  color: periodo === p.value ? '#fff' : 'var(--app-brand-text)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={recargar}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium text-sm"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Total OTs"
          value={String(summary.totalOTs)}
          color="#1565C0"
          icon="📋"
        />
        <KpiCard
          label="Pendientes"
          value={String(summary.otsAbiertas + summary.otsEnProgreso)}
          hint={`${summary.otsAbiertas} abiertas · ${summary.otsEnProgreso} en progreso`}
          color="#E65100"
          icon="⏳"
        />
        <KpiCard
          label="Cumplimiento"
          value={`${summary.cumplimiento.toFixed(0)}%`}
          hint={`${summary.otsCerradas} cerradas`}
          color="#2E7D32"
          icon="✅"
        />
        <KpiCard
          label="MTTR"
          value={summary.mttr > 0 ? fmtHours(summary.mttr) : '—'}
          hint="Promedio correctivas"
          color="#6A1B9A"
          icon="🛠️"
        />
        <KpiCard
          label="Horas Hombre"
          value={fmtHours(summary.horasTrabajadas)}
          color="#00838F"
          icon="⏱️"
        />
        <KpiCard
          label="Costo Mano de Obra"
          value={`Bs ${fmtCurrency(summary.costoManoObra)}`}
          color="#6A1B9A"
          icon="👷"
        />
        <KpiCard
          label="Costo Materiales"
          value={`Bs ${fmtCurrency(summary.costoMateriales)}`}
          color="#D32F2F"
          icon="📦"
        />
        <KpiCard
          label="Costo Total"
          value={`Bs ${fmtCurrency(summary.costoTotal)}`}
          hint={`Prom. Bs ${fmtCurrency(summary.costoPromedioPorOT)} / OT`}
          color="#B8860B"
          icon="💰"
        />
      </div>

      {/* Tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2E2E2E]">
          <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100">
            OTs Creadas vs. Cerradas por Mes
          </h3>
          {tendenciaOTs.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
              Sin datos en el período.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={tendenciaOTs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="creadas"
                  name="Creadas"
                  stroke="#1565C0"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cerradas"
                  name="Cerradas"
                  stroke="#2E7D32"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2E2E2E]">
          {data.costoPorMes.length === 0 ? (
            <>
              <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Costo de Mantenimiento por Mes (Bs)
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
                Sin datos en el período.
              </p>
            </>
          ) : (
            <BiLineChart
              data={data.costoPorMes}
              title="Costo de Mantenimiento por Mes (Bs)"
              height={280}
            />
          )}
        </div>
      </div>

      {/* Distribuciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2E2E2E]">
          {data.otsPorEstado.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
              Sin datos.
            </p>
          ) : (
            <BiPieChart
              data={data.otsPorEstado}
              title="OTs por Estado"
              height={260}
            />
          )}
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2E2E2E]">
          {data.otsPorTipo.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
              Sin datos.
            </p>
          ) : (
            <BiBarChart
              data={data.otsPorTipo}
              title="OTs por Tipo de Mantenimiento"
              height={260}
            />
          )}
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2E2E2E]">
          {data.otsPorDepartamento.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
              Sin datos.
            </p>
          ) : (
            <BiBarChart
              data={data.otsPorDepartamento}
              title="OTs por Departamento"
              height={260}
            />
          )}
        </div>
      </div>

      {/* Rankings y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Ranking activos */}
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2E2E2E]">
          <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100">
            Top 5 Activos por Costo
          </h3>
          {data.rankingActivos.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              Sin datos.
            </p>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {data.rankingActivos.map((a, i) => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-50 dark:border-[#2E2E2E] last:border-0"
                  >
                    <td className="py-2 pr-2 text-gray-400 dark:text-gray-500 w-5">
                      {i + 1}
                    </td>
                    <td className="py-2 pr-2">
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {a.nombre}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        {a.ots} OTs · {fmtHours(a.horas)}
                      </div>
                    </td>
                    <td className="py-2 text-right font-bold text-[#D32F2F] whitespace-nowrap">
                      Bs {fmtCurrency(a.costo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Ranking técnicos */}
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2E2E2E]">
          <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100">
            Top 5 Técnicos por Horas Trabajadas
          </h3>
          {data.rankingTecnicos.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              Sin datos.
            </p>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {data.rankingTecnicos.map((t, i) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-50 dark:border-[#2E2E2E] last:border-0"
                  >
                    <td className="py-2 pr-2 text-gray-400 dark:text-gray-500 w-5">
                      {i + 1}
                    </td>
                    <td className="py-2 pr-2">
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {t.nombre}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        {t.intervenciones} intervenciones
                      </div>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <div className="font-bold text-[#6A1B9A]">
                        {fmtHours(t.horas)}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        Bs {fmtCurrency(t.costo)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* OTs vencidas / envejecidas */}
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2E2E2E]">
          <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100">
            OTs Abiertas Más Antiguas
          </h3>
          {data.otsVencidas.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No hay OTs pendientes. 🎉
            </p>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {data.otsVencidas.map((o) => {
                  const c = diasColor(o.diasAbierta);
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-gray-50 dark:border-[#2E2E2E] last:border-0"
                    >
                      <td className="py-2 pr-2">
                        <div className="font-medium text-gray-800 dark:text-gray-100">
                          #{o.id} · {o.maquina}
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 truncate max-w-[180px]">
                          {o.descripcion}
                        </div>
                      </td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: c.bg, color: c.color }}
                        >
                          {o.diasAbierta} días
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Accesos rápidos a reportes detallados */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2E2E2E]">
        <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100">
          Reportes y Análisis Detallados
        </h3>
        <div className="flex flex-wrap gap-2">
          {ACCESOS_RAPIDOS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="px-3 py-2 rounded-lg text-xs font-semibold border transition hover:shadow-sm"
              style={{
                color: a.color,
                // color-mix en vez de concatenar alfa: a.color puede ser una
                // variable CSS de tema.
                borderColor: `color-mix(in srgb, ${a.color} 33%, transparent)`,
                background: `color-mix(in srgb, ${a.color} 5%, transparent)`,
              }}
            >
              {a.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
