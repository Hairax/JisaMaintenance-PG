import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
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
  maquina?: { id: number };
  fechaHora: string;
  estado: string;
  tipoOT?: { id: number; nombre?: string; name?: string };
  descripcionTarea: string;
}

interface Salida {
  id: number;
  otId: number;
  total: number;
  fecha: string;
}

interface OTConCosto {
  id: number;
  tipo: string;
  estado: string;
  fecha: string;
  costo: number;
  descripcion: string;
}

interface ActivoCosto {
  id: number;
  nombre: string;
  tipo: string;
  ordenes: OTConCosto[];
  costoTotal: number;
  costoPromedio: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) =>
  `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getName = (obj?: { nombre?: string; name?: string }) =>
  obj?.nombre ?? obj?.name ?? '—';

// ── Ranking sub-component ─────────────────────────────────────────────────────

interface RankingProps {
  costosPorActivo: ActivoCosto[];
  modo: 'total' | 'promedio';
  fechaInicio: string;
  fechaFin: string;
}

function RankingCostos({
  costosPorActivo,
  modo,
  fechaInicio,
  fechaFin,
}: RankingProps) {
  const [sortAsc, setSortAsc] = useState(false);

  const ranking = useMemo(() => {
    return costosPorActivo.map((activo) => {
      const ordenesFiltradas = activo.ordenes.filter((ot) => {
        const fechaOT = ot.fecha.slice(0, 10);
        return (
          (!fechaInicio || fechaOT >= fechaInicio) &&
          (!fechaFin || fechaOT <= fechaFin)
        );
      });
      const costoTotal = ordenesFiltradas.reduce(
        (acc, ot) => acc + ot.costo,
        0,
      );
      const costoPromedio =
        ordenesFiltradas.length > 0 ? costoTotal / ordenesFiltradas.length : 0;
      return {
        id: activo.id,
        nombre: activo.nombre,
        tipo: activo.tipo,
        cantidad: ordenesFiltradas.length,
        costo: modo === 'total' ? costoTotal : costoPromedio,
      };
    });
  }, [costosPorActivo, fechaInicio, fechaFin, modo]);

  const sorted = useMemo(
    () =>
      [...ranking].sort((a, b) =>
        sortAsc ? a.costo - b.costo : b.costo - a.costo,
      ),
    [ranking, sortAsc],
  );

  const exportToExcel = () => {
    const data = sorted.map((row, i) => ({
      '#': i + 1,
      Activo: row.nombre,
      Tipo: row.tipo,
      '# OTs': row.cantidad,
      [modo === 'total' ? 'Costo Total (Bs)' : 'Costo Promedio (Bs)']:
        row.costo.toFixed(2),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ranking');
    XLSX.writeFile(workbook, 'ranking_costos.xlsx');
  };

  return (
    <div className="mt-10 bg-white dark:bg-[#232323] p-4 rounded-xl shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          Ranking de Costos por Activo
        </span>
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
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
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                Tipo
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                # OTs
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                <button
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() => setSortAsc((v) => !v)}
                  title="Ordenar por costo"
                >
                  {modo === 'total' ? 'Costo Total' : 'Costo Promedio'}{' '}
                  {sortAsc ? '▲' : '▼'}
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
                <td className="border border-gray-300 dark:border-gray-700 p-2">
                  {row.tipo}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                  {row.cantidad}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                  {fmtCurrency(row.costo)}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-300 dark:border-gray-700 p-3 text-center text-gray-400 dark:text-gray-500"
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

export default function KPICostoPorActivo() {
  const [costosPorActivo, setCostosPorActivo] = useState<ActivoCosto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [modo, setModo] = useState<'total' | 'promedio'>('total');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resMaq, resOTs, resSal] = await Promise.all([
        fetch(`${API}/maquinas`),
        fetch(`${API}/ots`),
        fetch(`${API}/salidas`),
      ]);
      const [maquinas, ots, salidas] = (await Promise.all([
        resMaq.ok ? resMaq.json() : [],
        resOTs.ok ? resOTs.json() : [],
        resSal.ok ? resSal.json() : [],
      ])) as [Maquina[], OT[], Salida[]];

      // Build salida cost map: otId → total cost
      const costoPorOT: Record<number, number> = {};
      for (const s of Array.isArray(salidas) ? salidas : []) {
        const otId = Number(s.otId);
        costoPorOT[otId] = (costoPorOT[otId] ?? 0) + Number(s.total);
      }

      const rows: ActivoCosto[] = (Array.isArray(maquinas) ? maquinas : []).map(
        (maq) => {
          const maqOTs = (Array.isArray(ots) ? ots : []).filter(
            (ot) =>
              Number(ot.maquina_id) === maq.id ||
              Number(ot.maquina?.id) === maq.id,
          );

          const ordenes: OTConCosto[] = maqOTs.map((ot) => ({
            id: ot.id,
            tipo: getName(ot.tipoOT),
            estado: ot.estado,
            fecha: ot.fechaHora ?? '',
            costo: costoPorOT[ot.id] ?? 0,
            descripcion: ot.descripcionTarea,
          }));

          const costoTotal = ordenes.reduce((s, o) => s + o.costo, 0);
          const costoPromedio =
            ordenes.length > 0 ? costoTotal / ordenes.length : 0;

          return {
            id: maq.id,
            nombre: maq.name,
            tipo: maq.tipoDeMaquina || '—',
            ordenes,
            costoTotal,
            costoPromedio,
          };
        },
      );

      setCostosPorActivo(rows);
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

  const datosFiltrados = useMemo(() => {
    return costosPorActivo.map((activo) => {
      const ordenesFiltradas = activo.ordenes.filter((ot) => {
        const fechaOT = ot.fecha.slice(0, 10);
        return (
          (!fechaInicio || fechaOT >= fechaInicio) &&
          (!fechaFin || fechaOT <= fechaFin)
        );
      });
      const costoTotal = ordenesFiltradas.reduce(
        (acc, ot) => acc + ot.costo,
        0,
      );
      const costoPromedio =
        ordenesFiltradas.length > 0 ? costoTotal / ordenesFiltradas.length : 0;
      return {
        ...activo,
        ordenes: ordenesFiltradas,
        costoTotal,
        costoPromedio,
      };
    });
  }, [costosPorActivo, fechaInicio, fechaFin]);

  const maxCosto = useMemo(
    () =>
      Math.max(
        ...datosFiltrados.map((a) =>
          modo === 'total' ? a.costoTotal : a.costoPromedio,
        ),
        1,
      ),
    [datosFiltrados, modo],
  );

  if (loading)
    return (
      <div className="p-6 text-center text-gray-400 dark:text-gray-500">
        Cargando datos de costos...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
        <button
          onClick={cargarDatos}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Reintentar
        </button>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          KPI — Costo por Activo
        </h1>
        <button
          onClick={cargarDatos}
          className="bg-blue-700 text-white px-4 py-1.5 rounded hover:bg-blue-800 text-sm"
        >
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400">
            Fecha inicio
          </label>
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100 dark:[color-scheme:dark] p-1 rounded"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400">
            Fecha fin
          </label>
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100 dark:[color-scheme:dark] p-1 rounded"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400">
            Modo
          </label>
          <select
            className="border border-gray-300 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100 p-1 rounded"
            value={modo}
            onChange={(e) => setModo(e.target.value as 'total' | 'promedio')}
          >
            <option value="total">Costo total</option>
            <option value="promedio">Costo promedio</option>
          </select>
        </div>
        {(fechaInicio || fechaFin) && (
          <button
            onClick={() => {
              setFechaInicio('');
              setFechaFin('');
            }}
            className="text-sm text-gray-500 dark:text-gray-400 underline mt-4"
          >
            Limpiar fechas
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Activos con OTs',
            value: datosFiltrados.filter((a) => a.ordenes.length > 0).length,
          },
          {
            label: 'Total OTs',
            value: datosFiltrados.reduce((s, a) => s + a.ordenes.length, 0),
          },
          {
            label: 'Costo total',
            value: fmtCurrency(
              datosFiltrados.reduce((s, a) => s + a.costoTotal, 0),
            ),
          },
          {
            label: 'Activos sin costo',
            value: datosFiltrados.filter((a) => a.costoTotal === 0).length,
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

      {/* Main table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 dark:border-gray-700 rounded">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-200">
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                Activo
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                Tipo
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                # OTs
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                {modo === 'total' ? 'Costo Total' : 'Costo Promedio'}
              </th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((activo) => (
              <tr
                key={activo.id}
                className="text-center text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2A2A2A]"
              >
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                  {activo.nombre}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                  {activo.tipo}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">
                  {activo.ordenes.length}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-2">
                  {fmtCurrency(
                    modo === 'total' ? activo.costoTotal : activo.costoPromedio,
                  )}
                </td>
              </tr>
            ))}
            {datosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="border border-gray-300 dark:border-gray-700 p-4 text-center text-gray-400 dark:text-gray-500"
                >
                  Sin activos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bar chart */}
      <div className="mt-6 bg-white dark:bg-[#232323] p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Gráfico de costos
        </h2>
        {datosFiltrados.filter((a) => a.ordenes.length > 0).length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Sin datos para graficar.
          </p>
        ) : (
          <div className="flex items-end gap-3 mt-2 overflow-x-auto pb-2">
            {datosFiltrados
              .filter((a) => a.ordenes.length > 0)
              .sort((a, b) =>
                modo === 'total'
                  ? b.costoTotal - a.costoTotal
                  : b.costoPromedio - a.costoPromedio,
              )
              .map((activo) => {
                const valor =
                  modo === 'total' ? activo.costoTotal : activo.costoPromedio;
                const height = Math.max(
                  4,
                  Math.round((valor / maxCosto) * 180),
                );
                return (
                  <div
                    key={activo.id}
                    className="flex flex-col items-center min-w-[48px]"
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {fmtCurrency(valor)}
                    </span>
                    <div
                      className="bg-blue-500 w-10 rounded-t hover:bg-blue-600 transition-all"
                      style={{ height }}
                      title={`${activo.nombre}: ${fmtCurrency(valor)}`}
                    />
                    <span
                      className="text-xs mt-1 text-center max-w-[60px] leading-tight truncate text-gray-700 dark:text-gray-300"
                      title={activo.nombre}
                    >
                      {activo.nombre}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <RankingCostos
        costosPorActivo={costosPorActivo}
        modo={modo}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
      />
    </div>
  );
}
