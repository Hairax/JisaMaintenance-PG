// src/features/kpis/TMEFPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { API_URL } from '../../shared/config/api';

const API = API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Maquina {
  id: number;
  name: string;
  tipoDeMaquina: string;
}

interface OT {
  id: number;
  maquina_id: number;
  maquina?: { id: number; name?: string };
  estado: string;
  fechaHora: string;
  fechaCreacion: string;
  descripcionTarea: string;
  tipoOT?: { id: number; nombre?: string };
  tipoEjecucion?: string;
}

interface OTFalla {
  id: number;
  fechaInicio: string; // "YYYY-MM-DD"
  tipoFalla: string;
}

interface ActivoConOTs {
  id: number;
  nombre: string;
  ots: OTFalla[]; // only corrective OTs
}

interface TMEFRow {
  activo: string;
  tmef: number | null;
  fallas: number;
  ultimaFalla: string | null;
  tiposFalla: string[];
  fallasDetalle: OTFalla[];
}

interface HeatmapPoint {
  activo: string;
  fecha: number;
  tipoFalla: string;
  intensidad: number;
}

interface RankingRow {
  id: number;
  nombre: string;
  tmef: number | null;
  fallas: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isCorrectivo(ot: OT): boolean {
  const nombre = (ot.tipoOT?.nombre ?? '').toLowerCase();
  const ejecucion = (ot.tipoEjecucion ?? '').toLowerCase();
  return nombre.includes('correctiv') || ejecucion.includes('correctiv');
}

function computeTMEFForActivo(
  ots: OTFalla[],
  from: string,
  to: string,
  activoNombre: string,
): TMEFRow {
  const filtered = ots.filter((ot) => {
    const f = ot.fechaInicio;
    return (!from || f >= from) && (!to || f <= to);
  });

  const tiposFallaCount: Record<string, number> = {};
  for (const ot of filtered) {
    tiposFallaCount[ot.tipoFalla] = (tiposFallaCount[ot.tipoFalla] ?? 0) + 1;
  }
  const tiposFalla = Object.entries(tiposFallaCount).map(
    ([tipo, count]) => `${tipo} (${count})`,
  );
  const ultimaFalla =
    filtered.length > 0
      ? [...filtered].sort((a, b) =>
          b.fechaInicio.localeCompare(a.fechaInicio),
        )[0].fechaInicio
      : null;

  if (filtered.length < 2) {
    return {
      activo: activoNombre,
      tmef: null,
      fallas: filtered.length,
      ultimaFalla,
      tiposFalla,
      fallasDetalle: filtered,
    };
  }

  const fechas = filtered
    .map((ot) => new Date(ot.fechaInicio))
    .sort((a, b) => a.getTime() - b.getTime());

  let totalIntervalo = 0;
  for (let i = 1; i < fechas.length; i++) {
    totalIntervalo +=
      (fechas[i].getTime() - fechas[i - 1].getTime()) / (1000 * 60 * 60 * 24);
  }

  return {
    activo: activoNombre,
    tmef: totalIntervalo / (fechas.length - 1),
    fallas: filtered.length,
    ultimaFalla,
    tiposFalla,
    fallasDetalle: filtered,
  };
}

// ── RankingTMEF sub-component ─────────────────────────────────────────────────

interface RankingTMEFProps {
  activos: ActivoConOTs[];
}

function RankingTMEF({ activos }: RankingTMEFProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  // Exportar ranking a Excel
  const exportToExcel = () => {
    const data = sorted.map((row, i) => ({
      '#': i + 1,
      Activo: row.nombre,
      Fallas: row.fallas,
      'TMEF (días)': row.tmef !== null ? row.tmef.toFixed(2) : 'No calculable',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ranking TMEF');
    XLSX.writeFile(
      wb,
      `ranking_tmef_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const ranking = useMemo<RankingRow[]>(() => {
    return activos.map((activo) => {
      const row = computeTMEFForActivo(activo.ots, from, to, activo.nombre);
      return {
        id: activo.id,
        nombre: activo.nombre,
        tmef: row.tmef,
        fallas: row.fallas,
      };
    });
  }, [activos, from, to]);

  const sorted = useMemo(
    () =>
      [...ranking].sort((a, b) =>
        sortAsc
          ? (a.tmef ?? -1) - (b.tmef ?? -1)
          : (b.tmef ?? -1) - (a.tmef ?? -1),
      ),
    [ranking, sortAsc],
  );

  return (
    <div className="mt-10 bg-white dark:bg-[#232323] p-4 rounded-xl shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          Ranking TMEF por Activo
        </span>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Desde
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100 dark:[color-scheme:dark] rounded px-2 py-1"
          />
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Hasta
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100 dark:[color-scheme:dark] rounded px-2 py-1"
          />
        </div>
        <button
          className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold shadow"
          onClick={exportToExcel}
        >
          Exportar a Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-200">
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                #
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                Activo
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                Fallas
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                <button
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() => setSortAsc((v) => !v)}
                  title="Ordenar por TMEF"
                >
                  TMEF (días) {sortAsc ? '▲' : '▼'}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors text-gray-800 dark:text-gray-100"
              >
                <td className="border border-gray-300 dark:border-gray-700 p-2">
                  {i + 1}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">
                  {row.nombre}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                  {row.fallas}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                  {row.tmef !== null ? row.tmef.toFixed(2) : 'No calculable'}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="border border-gray-300 dark:border-gray-700 p-4 text-center text-gray-400 dark:text-gray-500"
                >
                  Sin datos para el rango seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TMEFPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [activosConOTs, setActivosConOTs] = useState<ActivoConOTs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [activoSeleccionado, setActivoSeleccionado] = useState('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resMaq, resOTs] = await Promise.all([
        fetch(`${API}/maquinas`),
        fetch(`${API}/ots`),
      ]);
      const [rawMaquinas, rawOTs] = (await Promise.all([
        resMaq.ok ? resMaq.json() : Promise.resolve([]),
        resOTs.ok ? resOTs.json() : Promise.resolve([]),
      ])) as [Maquina[], OT[]];

      const maqList = Array.isArray(rawMaquinas) ? rawMaquinas : [];
      const otList = Array.isArray(rawOTs) ? rawOTs : [];

      const rows: ActivoConOTs[] = maqList.map((maq) => {
        const maqOTs = otList.filter(
          (ot) =>
            Number(ot.maquina_id) === maq.id ||
            Number(ot.maquina?.id) === maq.id,
        );
        const ots: OTFalla[] = maqOTs
          .filter((ot) => isCorrectivo(ot))
          .map((ot) => ({
            id: ot.id,
            fechaInicio: (ot.fechaHora ?? ot.fechaCreacion ?? '').slice(0, 10),
            tipoFalla: ot.tipoOT?.nombre ?? ot.descripcionTarea ?? '—',
          }));
        return { id: maq.id, nombre: maq.name, ots };
      });

      setMaquinas(maqList);
      setActivosConOTs(rows);
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

  const activosFiltrados = useMemo(
    () =>
      activosConOTs.filter(
        (a) => !activoSeleccionado || a.id.toString() === activoSeleccionado,
      ),
    [activosConOTs, activoSeleccionado],
  );

  const tmefData = useMemo<TMEFRow[]>(
    () =>
      activosFiltrados.map((activo) =>
        computeTMEFForActivo(activo.ots, fechaInicio, fechaFin, activo.nombre),
      ),
    [activosFiltrados, fechaInicio, fechaFin],
  );

  const heatmapData = useMemo<HeatmapPoint[]>(() => {
    const data: HeatmapPoint[] = [];
    for (const item of tmefData) {
      for (const ot of item.fallasDetalle) {
        data.push({
          activo: item.activo,
          fecha: new Date(ot.fechaInicio).getTime(),
          tipoFalla: ot.tipoFalla,
          intensidad: 1,
        });
      }
    }
    return data;
  }, [tmefData]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-400 dark:text-gray-500">
        Cargando datos de TMEF...
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
        <button
          onClick={cargarDatos}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Reintentar
        </button>
      </div>
    );

  const axisTick = { fill: isDark ? '#D1D5DB' : '#374151' };
  const gridStroke = isDark ? '#3A3A3A' : '#e5e7eb';
  const tooltipStyle = {
    background: isDark ? '#232323' : '#fff',
    border: `1px solid ${isDark ? '#3A3A3A' : '#e5e7eb'}`,
    color: isDark ? '#F5F5F5' : '#111827',
    borderRadius: 8,
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-[#1A1A1A] min-h-screen">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          KPI: Tiempo Medio Entre Fallas (TMEF)
        </h1>
        <button
          onClick={cargarDatos}
          className="bg-blue-700 text-white px-4 py-1.5 rounded hover:bg-blue-800 text-sm"
        >
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white dark:bg-[#232323] p-4 rounded-xl shadow">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Activo
          </label>
          <select
            value={activoSeleccionado}
            onChange={(e) => setActivoSeleccionado(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100 rounded px-2 py-1"
          >
            <option value="">Todos</option>
            {maquinas.map((m) => (
              <option key={m.id} value={m.id.toString()}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100 dark:[color-scheme:dark] rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Fecha Fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100 dark:[color-scheme:dark] rounded px-2 py-1"
          />
        </div>

        <div className="flex items-end">
          {(fechaInicio || fechaFin || activoSeleccionado) && (
            <button
              onClick={() => {
                setFechaInicio('');
                setFechaFin('');
                setActivoSeleccionado('');
              }}
              className="text-sm text-gray-500 dark:text-gray-400 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Activos analizados', value: tmefData.length },
          {
            label: 'Total fallas correctivas',
            value: tmefData.reduce((s, r) => s + r.fallas, 0),
          },
          {
            label: 'TMEF promedio (días)',
            value: (() => {
              const calculables = tmefData.filter((r) => r.tmef !== null);
              if (calculables.length === 0) return '—';
              const avg =
                calculables.reduce((s, r) => s + (r.tmef as number), 0) /
                calculables.length;
              return avg.toFixed(1);
            })(),
          },
          {
            label: 'Sin datos suficientes',
            value: tmefData.filter((r) => r.tmef === null).length,
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white dark:bg-[#232323] rounded-xl shadow p-4 text-center"
          >
            <div className="text-xl font-bold text-gray-700 dark:text-gray-100">
              {c.value}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white dark:bg-[#232323] rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-200">
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                Activo
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                Fallas
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                TMEF (días)
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                Última Falla
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                Tipos de Falla
              </th>
            </tr>
          </thead>
          <tbody>
            {tmefData.map((item, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors text-gray-800 dark:text-gray-100"
              >
                <td className="border border-gray-300 dark:border-gray-700 p-2">
                  {item.activo}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                  {item.fallas}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                  {item.tmef !== null ? item.tmef.toFixed(2) : 'No calculable'}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                  {item.ultimaFalla
                    ? new Date(item.ultimaFalla).toLocaleDateString()
                    : '-'}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-sm">
                  {item.tiposFalla.length > 0
                    ? item.tiposFalla.join(', ')
                    : '-'}
                </td>
              </tr>
            ))}
            {tmefData.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-300 dark:border-gray-700 p-4 text-center text-gray-400 dark:text-gray-500"
                >
                  Sin datos para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Gráfico de barras */}
      <div className="mt-8 bg-white dark:bg-[#232323] p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Gráfico TMEF por Activo (días)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tmefData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="activo" tick={axisTick} />
            <YAxis tick={axisTick} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) =>
                v !== null ? v.toFixed(2) : 'No calculable'
              }
            />
            <Bar dataKey="tmef" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap de fallas */}
      <div className="mt-8 bg-white dark:bg-[#232323] p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Historial de Fallas Correctivas
        </h2>
        {heatmapData.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Sin fallas correctivas en el período.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                type="number"
                dataKey="fecha"
                domain={['auto', 'auto']}
                tickFormatter={(unixTime: number) =>
                  new Date(unixTime).toLocaleDateString()
                }
                name="Fecha"
                tick={axisTick}
              />
              <YAxis
                type="category"
                dataKey="tipoFalla"
                name="Tipo de Falla"
                tick={axisTick}
              />
              <ZAxis type="number" dataKey="intensidad" range={[50, 200]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={tooltipStyle}
                formatter={(value: number | string, name: string) => {
                  if (name === 'fecha') {
                    return new Date(value as number).toLocaleDateString();
                  }
                  return value;
                }}
              />
              <Scatter data={heatmapData} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      <RankingTMEF activos={activosConOTs} />
    </div>
  );
}
