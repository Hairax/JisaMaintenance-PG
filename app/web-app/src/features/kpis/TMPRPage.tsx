// src/features/kpis/TMPRPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

const API = 'http://localhost:3000';

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
  tecnicos?: number[];
}

interface RawDetalle {
  id: number;
  otId: number;
  horaInicio: string;
  observaciones?: string;
  createdAt: string;
  [key: string]: unknown; // horaFinalización has accent
}

interface RawInforme {
  id: number;
  userId: number;
  detalles: RawDetalle[];
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  lastName: string;
}

// Computed OT with repair time
interface OTReparacion {
  id: number;
  maquinaId: number;
  maquinaNombre: string;
  fechaInicio: string; // "YYYY-MM-DD"
  horasReparacion: number; // sum of worked hours from informe detalles
  estado: string;
  descripcion: string;
  tecnicoIds: number[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function minutesBetween(inicio: string, fin: string): number {
  // Full datetime strings
  if (inicio.includes('T') && fin.includes('T')) {
    const diff = (new Date(fin).getTime() - new Date(inicio).getTime()) / 60000;
    return diff > 0 ? diff : 0;
  }
  // Legacy: time-only strings "HH:MM" or "HH:MM:SS"
  const toMin = (v: string) => {
    const t = v.includes('T') ? v.split('T')[1] : v;
    const [h, m] = t.slice(0, 5).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const diff = toMin(fin) - toMin(inicio);
  return diff > 0 ? diff : 0;
}

function isCorrectivo(ot: OT): boolean {
  const nombre = (ot.tipoOT?.nombre ?? '').toLowerCase();
  const ejecucion = (ot.tipoEjecucion ?? '').toLowerCase();
  return nombre.includes('correctiv') || ejecucion.includes('correctiv');
}

// ── RankingTMPR sub-component ─────────────────────────────────────────────────

interface RankingTMPRProps {
  maquinas: Maquina[];
  otsReparacion: OTReparacion[];
}

interface RankingRow {
  id: number;
  nombre: string;
  reparaciones: number;
  tmpr: number | null;
}

function RankingTMPR({ maquinas, otsReparacion }: RankingTMPRProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  const ranking = useMemo<RankingRow[]>(() => {
    return maquinas.map((maq) => {
      const ots = otsReparacion.filter(
        (ot) =>
          ot.maquinaId === maq.id &&
          (!from || ot.fechaInicio >= from) &&
          (!to || ot.fechaInicio <= to),
      );
      if (ots.length === 0) {
        return { id: maq.id, nombre: maq.name, tmpr: null, reparaciones: 0 };
      }
      const totalHoras = ots.reduce((s, ot) => s + ot.horasReparacion, 0);
      return {
        id: maq.id,
        nombre: maq.name,
        tmpr: totalHoras / ots.length,
        reparaciones: ots.length,
      };
    });
  }, [maquinas, otsReparacion, from, to]);

  const sorted = useMemo(
    () =>
      [...ranking].sort((a, b) =>
        sortAsc
          ? (a.tmpr ?? -1) - (b.tmpr ?? -1)
          : (b.tmpr ?? -1) - (a.tmpr ?? -1),
      ),
    [ranking, sortAsc],
  );

  const exportToExcel = () => {
    const wsData: (string | number)[][] = [
      ['#', 'Activo', 'Reparaciones', 'TMPR (h)'],
      ...sorted.map((row, i) => [
        i + 1,
        row.nombre,
        row.reparaciones,
        row.tmpr !== null ? Number(row.tmpr.toFixed(2)) : 'No calculable',
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ranking TMPR');
    XLSX.writeFile(
      wb,
      `ranking_tmpr_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <div className="mt-10 bg-white p-4 rounded-xl shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <span className="font-semibold text-gray-700">
          Ranking TMPR por Activo
        </span>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm text-gray-600">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <label className="text-sm text-gray-600">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition ml-auto"
          onClick={exportToExcel}
        >
          Exportar a Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Activo</th>
              <th className="border p-2 text-center">Reparaciones</th>
              <th className="border p-2 text-center">
                <button
                  className="font-bold text-blue-600 hover:underline"
                  onClick={() => setSortAsc((v) => !v)}
                  title="Ordenar por TMPR"
                >
                  TMPR (h) {sortAsc ? '▲' : '▼'}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition-colors text-gray-800"
              >
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{row.nombre}</td>
                <td className="border p-2 text-center">{row.reparaciones}</td>
                <td className="border p-2 text-center">
                  {row.tmpr !== null ? row.tmpr.toFixed(2) : 'No calculable'}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="border p-4 text-center text-gray-400"
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

export default function TMPRPage() {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [otsReparacion, setOtsReparacion] = useState<OTReparacion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activoSeleccionado, setActivoSeleccionado] = useState('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resMaq, resOTs, resInf, resUsr] = await Promise.all([
        fetch(`${API}/maquinas`),
        fetch(`${API}/ots`),
        fetch(`${API}/informes`),
        fetch(`${API}/users`),
      ]);
      const [rawMaquinas, rawOTs, rawInformes, rawUsers] = (await Promise.all([
        resMaq.ok ? resMaq.json() : Promise.resolve([]),
        resOTs.ok ? resOTs.json() : Promise.resolve([]),
        resInf.ok ? resInf.json() : Promise.resolve([]),
        resUsr.ok ? resUsr.json() : Promise.resolve([]),
      ])) as [Maquina[], OT[], RawInforme[], User[]];

      const maqList = Array.isArray(rawMaquinas) ? rawMaquinas : [];
      const otList = Array.isArray(rawOTs) ? rawOTs : [];

      // Build map: otId → total worked hours (from informe detalles)
      const horasPorOT: Record<number, number> = {};
      for (const inf of Array.isArray(rawInformes) ? rawInformes : []) {
        for (const det of Array.isArray(inf.detalles) ? inf.detalles : []) {
          const otId = Number(det.otId);
          const horaInicio = det.horaInicio ?? '';
          const horaFin = (det['horaFinalización'] as string) ?? '';
          const mins = minutesBetween(horaInicio, horaFin);
          horasPorOT[otId] = (horasPorOT[otId] ?? 0) + mins / 60;
        }
      }

      // Build a name map for machines
      const maqNombreMap: Record<number, string> = {};
      for (const m of maqList) maqNombreMap[m.id] = m.name;

      // Filter to corrective OTs only
      const correctivas: OTReparacion[] = otList
        .filter((ot) => isCorrectivo(ot))
        .map((ot) => {
          const maqId = Number(ot.maquina_id) || Number(ot.maquina?.id) || 0;
          return {
            id: ot.id,
            maquinaId: maqId,
            maquinaNombre: maqNombreMap[maqId] ?? `Máquina #${maqId}`,
            fechaInicio: (ot.fechaHora ?? ot.fechaCreacion ?? '').slice(0, 10),
            horasReparacion: horasPorOT[ot.id] ?? 0,
            estado: ot.estado,
            descripcion: ot.descripcionTarea,
            tecnicoIds: Array.isArray(ot.tecnicos) ? ot.tecnicos : [],
          };
        });

      setMaquinas(maqList);
      setOtsReparacion(correctivas);
      setUsers(Array.isArray(rawUsers) ? rawUsers : []);
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

  // Filtered OTs by selected machine
  const otsFiltradas = useMemo(
    () =>
      otsReparacion.filter(
        (ot) =>
          !activoSeleccionado || ot.maquinaId.toString() === activoSeleccionado,
      ),
    [otsReparacion, activoSeleccionado],
  );

  // Global TMPR across filtered OTs
  const tmpr = useMemo(() => {
    if (otsFiltradas.length === 0) return 0;
    const total = otsFiltradas.reduce((s, ot) => s + ot.horasReparacion, 0);
    return total / otsFiltradas.length;
  }, [otsFiltradas]);

  // Bar chart height scale (max 180px)
  const maxHoras = useMemo(
    () => Math.max(...otsFiltradas.map((ot) => ot.horasReparacion), 1),
    [otsFiltradas],
  );

  const getUserName = (id: number) => {
    const u = users.find((u) => u.id === id);
    return u ? `${u.name} ${u.lastName}` : `Técnico #${id}`;
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-400">
        Cargando datos de TMPR...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-3">{error}</p>
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
        <h1 className="text-2xl font-bold">
          KPI — TMPR: Tiempo Medio Para Reparar
        </h1>
        <button
          onClick={cargarDatos}
          className="bg-blue-700 text-white px-4 py-1.5 rounded hover:bg-blue-800 text-sm"
        >
          Actualizar
        </button>
      </div>

      {/* Filtro por activo */}
      <div className="flex gap-4 items-center flex-wrap bg-white p-4 rounded-xl shadow">
        <label className="font-semibold text-sm text-gray-700">
          Seleccionar activo:
        </label>
        <select
          className="border rounded px-2 py-1"
          value={activoSeleccionado}
          onChange={(e) => setActivoSeleccionado(e.target.value)}
        >
          <option value="">Todos</option>
          {maquinas.map((m) => (
            <option key={m.id} value={m.id.toString()}>
              {m.name}
            </option>
          ))}
        </select>
        {activoSeleccionado && (
          <button
            onClick={() => setActivoSeleccionado('')}
            className="text-sm text-gray-500 underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'OTs correctivas', value: otsFiltradas.length },
          { label: 'TMPR promedio (h)', value: tmpr.toFixed(2) },
          {
            label: 'Total horas reparación',
            value: otsFiltradas
              .reduce((s, ot) => s + ot.horasReparacion, 0)
              .toFixed(2),
          },
          {
            label: 'Sin tiempo registrado',
            value: otsFiltradas.filter((ot) => ot.horasReparacion === 0).length,
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl shadow p-4 text-center"
          >
            <div className="text-xl font-bold text-gray-700">{c.value}</div>
            <div className="text-xs text-gray-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* KPI principal */}
      <div className="bg-blue-100 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700">
          Tiempo Medio Para Reparar (TMPR)
        </h2>
        <p className="text-4xl font-bold text-blue-700 mt-1">
          {tmpr.toFixed(2)} h
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Promedio calculado sobre las horas de trabajo registradas en informes
          de las OTs correctivas
          {activoSeleccionado
            ? ` del activo "${maquinas.find((m) => m.id.toString() === activoSeleccionado)?.name ?? ''}"`
            : ''}
          .
        </p>
      </div>

      {/* Gráfico de barras */}
      {otsFiltradas.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Horas de reparación por OT
          </h3>
          <div
            className="flex items-end gap-2 overflow-x-auto pb-2"
            style={{ minHeight: 200 }}
          >
            {otsFiltradas.map((ot) => {
              const height = Math.max(
                4,
                Math.round((ot.horasReparacion / maxHoras) * 180),
              );
              return (
                <div
                  key={ot.id}
                  className="flex flex-col items-center min-w-[48px]"
                >
                  <span className="text-xs text-gray-500 mb-1">
                    {ot.horasReparacion.toFixed(1)}h
                  </span>
                  <div
                    className="bg-blue-500 w-10 rounded-t hover:bg-blue-600 transition-all"
                    style={{ height }}
                    title={`OT #${ot.id} — ${ot.maquinaNombre}: ${ot.horasReparacion.toFixed(2)} h`}
                  />
                  <span className="text-xs mt-1 text-center">OT-{ot.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabla detallada */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-2 text-left">OT #</th>
              <th className="border p-2 text-left">Activo</th>
              <th className="border p-2 text-left">Descripción</th>
              <th className="border p-2 text-center">Fecha</th>
              <th className="border p-2 text-center">Estado</th>
              <th className="border p-2 text-center">Horas Rep.</th>
              <th className="border p-2 text-left">Técnicos</th>
            </tr>
          </thead>
          <tbody>
            {otsFiltradas.map((ot) => (
              <tr
                key={ot.id}
                className="hover:bg-gray-50 transition-colors text-gray-800"
              >
                <td className="border p-2">{ot.id}</td>
                <td className="border p-2">{ot.maquinaNombre}</td>
                <td
                  className="border p-2 max-w-[220px] truncate"
                  title={ot.descripcion}
                >
                  {ot.descripcion}
                </td>
                <td className="border p-2 text-center">{ot.fechaInicio}</td>
                <td className="border p-2 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      ot.estado === 'Cerrada'
                        ? 'bg-green-100 text-green-700'
                        : ot.estado === 'Abierta'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {ot.estado}
                  </span>
                </td>
                <td className="border p-2 text-center font-mono">
                  {ot.horasReparacion > 0 ? ot.horasReparacion.toFixed(2) : '—'}
                </td>
                <td className="border p-2 text-sm text-gray-600">
                  {ot.tecnicoIds.length > 0
                    ? ot.tecnicoIds.map(getUserName).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
            {otsFiltradas.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="border p-4 text-center text-gray-400"
                >
                  Sin OTs correctivas para el activo seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RankingTMPR maquinas={maquinas} otsReparacion={otsReparacion} />
    </div>
  );
}
