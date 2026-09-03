// src/features/kpis/Disponibilidad.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import DateRangePicker from './components/DateRangePicker';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { API_URL } from '../../shared/config/api';

const API = API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Maquina {
  id: number;
  name: string;
  tipoDeMaquina: string;
  fechaDeMontaje: string;
  createdAt: string;
}

interface OT {
  id: number;
  maquina_id: number;
  maquina?: { id: number };
}

// Raw informe detalle as returned by the API
interface RawDetalle {
  id: number;
  otId: number;
  horaInicio: string;
  observaciones?: string;
  createdAt: string;
  [key: string]: unknown; // horaFinalización has an accent
}

interface RawInforme {
  id: number;
  userId: number;
  detalles: RawDetalle[];
  createdAt: string;
}

// Normalized work detail (accent-free, easy to compute with)
interface WorkDetail {
  id: number;
  otId: number;
  fecha: string; // "YYYY-MM-DD" from createdAt
  horaInicio: string; // "HH:MM"
  horaFin: string; // "HH:MM" (from horaFinalización)
  observaciones?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getToday = () => new Date().toISOString().slice(0, 10);

// Extracts "HH:MM" from either a time string ("HH:MM:SS") or a datetime string ("YYYY-MM-DDTHH:MM:SS")
function extractHHMM(val: string): string {
  if (!val) return '00:00';
  const t = val.includes('T') ? val.split('T')[1] : val;
  return t.slice(0, 5);
}

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesBetween(inicio: string, fin: string): number {
  // Full datetime strings: compute precise duration
  if (inicio.includes('T') && fin.includes('T')) {
    const diff = (new Date(fin).getTime() - new Date(inicio).getTime()) / 60000;
    return diff > 0 ? diff : 0;
  }
  // Legacy: time-only strings "HH:MM" or "HH:MM:SS"
  const diff =
    parseTimeToMinutes(extractHHMM(fin)) -
    parseTimeToMinutes(extractHHMM(inicio));
  return diff > 0 ? diff : 0;
}

function formatPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

/**
 * Componente Gauge (simple, elegante)
 */
function Gauge({ value }: { value: number }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const radius = 90;
  const circumference = Math.PI * radius;
  const dash = (value / 100) * circumference;
  return (
    <div
      style={{
        width: 220,
        height: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%' }}>
        {/* fondo semicircle */}
        <path
          d={`M10 100 A90 90 0 0 1 190 100`}
          fill="none"
          stroke={isDark ? '#3A3A3A' : '#e6e9ef'}
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* progress */}
        <path
          d={`M10 100 A90 90 0 0 1 190 100`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform="rotate(0 100 100)"
        />
        {/* center text */}
        <text
          x="100"
          y="70"
          textAnchor="middle"
          fontSize="18"
          fill={isDark ? '#F5F5F5' : '#111'}
          fontWeight={700}
        >
          DISP
        </text>
        <text
          x="100"
          y="96"
          textAnchor="middle"
          fontSize="20"
          fill={isDark ? '#F5F5F5' : '#111'}
          fontWeight={700}
        >
          {formatPercent(value)}
        </text>
      </svg>
    </div>
  );
}

// ── Computation ───────────────────────────────────────────────────────────────

function computeDispForAsset(
  maquina: Maquina,
  fromISO: string,
  toISO: string,
  allDetails: WorkDetail[],
  allOTs: OT[],
): {
  totalHours: number;
  downtimeHours: number;
  dispo: number;
  details: WorkDetail[];
} {
  const fromDate = new Date(fromISO + 'T00:00:00');
  const toDate = new Date(toISO + 'T23:59:59');
  const msInHour = 1000 * 60 * 60;
  const totalHours = Math.max(
    (toDate.getTime() - fromDate.getTime()) / msInHour,
    0,
  );

  const otIdsForMachine = allOTs
    .filter(
      (o) =>
        Number(o.maquina_id) === maquina.id ||
        Number(o.maquina?.id) === maquina.id,
    )
    .map((o) => o.id);

  const matchingDetails = allDetails.filter((d) => {
    const fecha = new Date(d.fecha + 'T00:00:00');
    return (
      fecha >= fromDate && fecha <= toDate && otIdsForMachine.includes(d.otId)
    );
  });

  // Downtime = sum of worked hours in OTs (horaFin - horaInicio per detalle)
  const totalMinutesDown = matchingDetails.reduce(
    (acc, d) => acc + minutesBetween(d.horaInicio, d.horaFin),
    0,
  );
  const downtimeHours = totalMinutesDown / 60;
  const dispo =
    totalHours > 0 ? ((totalHours - downtimeHours) / totalHours) * 100 : 0;

  return { totalHours, downtimeHours, dispo, details: matchingDetails };
}

function buildDailyTrend(
  maquina: Maquina,
  fromISO: string,
  toISO: string,
  allDetails: WorkDetail[],
  allOTs: OT[],
): { date: string; disp: number }[] {
  const from = new Date(fromISO + 'T00:00:00');
  const to = new Date(toISO + 'T00:00:00');
  const days: { date: string; disp: number }[] = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dayStr = d.toISOString().slice(0, 10);
    const res = computeDispForAsset(
      maquina,
      dayStr,
      dayStr,
      allDetails,
      allOTs,
    );
    days.push({ date: dayStr, disp: Number(res.dispo.toFixed(2)) });
  }
  return days;
}

export default function KPI_DISP_Page() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getPageStyles(isDark);
  const cards = getCardStyles(isDark);
  const tableS = getTableStyles(isDark);

  const [machines, setMachines] = useState<Maquina[]>([]);
  const [allOTs, setAllOTs] = useState<OT[]>([]);
  const [allDetails, setAllDetails] = useState<WorkDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMachineId, setSelectedMachineId] = useState<number>(0);
  const [from, setFrom] = useState(getToday);
  const [to, setTo] = useState(getToday);
  const [customTotalHours, setCustomTotalHours] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resMaq, resOTs, resInf] = await Promise.all([
        fetch(`${API}/maquinas`),
        fetch(`${API}/ots`),
        fetch(`${API}/informes`),
      ]);
      const [rawMaquinas, rawOTs, rawInformes] = (await Promise.all([
        resMaq.ok ? resMaq.json() : Promise.resolve([]),
        resOTs.ok ? resOTs.json() : Promise.resolve([]),
        resInf.ok ? resInf.json() : Promise.resolve([]),
      ])) as [Maquina[], OT[], RawInforme[]];

      const maqList = Array.isArray(rawMaquinas) ? rawMaquinas : [];
      const otList = Array.isArray(rawOTs) ? rawOTs : [];

      // Flatten and normalize informe detalles into WorkDetail[]
      const details: WorkDetail[] = [];
      for (const inf of Array.isArray(rawInformes) ? rawInformes : []) {
        for (const det of Array.isArray(inf.detalles) ? inf.detalles : []) {
          details.push({
            id: det.id,
            otId: det.otId,
            fecha: (det.createdAt ?? '').slice(0, 10),
            horaInicio: extractHHMM(det.horaInicio ?? ''),
            horaFin: extractHHMM((det['horaFinalización'] as string) ?? ''),
            observaciones: det.observaciones,
          });
        }
      }

      setMachines(maqList);
      setAllOTs(otList);
      setAllDetails(details);

      if (maqList.length > 0) {
        const first = maqList[0];
        setSelectedMachineId(first.id);
        const defaultFrom = (
          first.fechaDeMontaje ??
          first.createdAt ??
          getToday()
        ).slice(0, 10);
        setFrom(defaultFrom);
        setTo(getToday());
      }
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

  const selectedMachine = machines.find((m) => m.id === selectedMachineId);

  // Sync date range when machine selection changes
  useEffect(() => {
    if (selectedMachine) {
      const newFrom = (
        selectedMachine.fechaDeMontaje ??
        selectedMachine.createdAt ??
        getToday()
      ).slice(0, 10);
      setFrom(newFrom);
      setTo(getToday());
      setCustomTotalHours(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachineId]);

  const dispResult = useMemo(() => {
    if (!selectedMachine)
      return {
        totalHours: 0,
        downtimeHours: 0,
        dispo: 0,
        details: [] as WorkDetail[],
      };
    const base = computeDispForAsset(
      selectedMachine,
      from,
      to,
      allDetails,
      allOTs,
    );
    let totalHours = base.totalHours;
    if (customTotalHours !== null && customTotalHours !== '') {
      const parsed = parseFloat(customTotalHours.replace(/,/g, '.'));
      if (!isNaN(parsed) && parsed > 0) totalHours = parsed;
    }
    const dispo =
      totalHours > 0
        ? ((totalHours - base.downtimeHours) / totalHours) * 100
        : 0;
    return { ...base, totalHours, dispo };
  }, [selectedMachine, from, to, allDetails, allOTs, customTotalHours]);

  const dailyTrend = useMemo(() => {
    if (!selectedMachine) return [];
    return buildDailyTrend(selectedMachine, from, to, allDetails, allOTs);
  }, [selectedMachine, from, to, allDetails, allOTs]);

  const prettyNumber = (n: number) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const axisTick = { fill: isDark ? '#D1D5DB' : '#374151' };
  const gridStroke = isDark ? '#3A3A3A' : '#e5e7eb';
  const tooltipStyle = {
    background: isDark ? '#232323' : '#fff',
    border: `1px solid ${isDark ? '#3A3A3A' : '#e5e7eb'}`,
    color: isDark ? '#F5F5F5' : '#111827',
    borderRadius: 8,
  };

  if (loading)
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: isDark ? '#999' : '#888',
        }}
      >
        Cargando datos de disponibilidad...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: isDark ? '#F87171' : '#dc2626', marginBottom: 12 }}>
          {error}
        </p>
        <button
          onClick={cargarDatos}
          style={{
            background: '#f59e0b',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h2 style={{ margin: 0 }}>KPI — Disponibilidad (DISP) por Activo</h2>
        <p
          style={{
            margin: '6px 0 0',
            color: isDark ? '#A0A0A0' : '#666',
          }}
        >
          Selecciona un activo y rango de fechas para ver DISP (tiempo operativo
          vs downtime desde órdenes/informes).
        </p>
      </header>

      <section style={styles.controls}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={styles.label}>Activo</label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(Number(e.target.value))}
              style={styles.select}
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <DateRangePicker
            from={from}
            to={to}
            onChange={(f, t) => {
              // validaciones básicas: si f>t no permitir
              if (new Date(f) > new Date(t)) return;
              setFrom(f);
              setTo(t);
            }}
          />
        </div>

        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ color: isDark ? '#AAA' : '#444', fontSize: 12 }}>
            Periodo total (hrs)
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              type="number"
              min={0}
              step={0.01}
              value={
                customTotalHours !== null
                  ? customTotalHours
                  : dispResult.totalHours
              }
              onChange={(e) => setCustomTotalHours(e.target.value)}
              style={{
                border: `1px solid ${isDark ? '#3A3A3A' : '#ddd'}`,
                background: isDark ? '#2A2A2A' : '#fff',
                color: isDark ? '#F5F5F5' : '#0f172a',
                fontSize: 18,
                fontWeight: 700,
                textAlign: 'right',
                outline: 'none',
                borderRadius: 6,
                width: 90,
                padding: '2px 8px',
              }}
              title="Puedes personalizar el tiempo disponible para el KPI"
            />
            <button
              style={{
                marginLeft: 4,
                fontSize: 13,
                color: isDark ? '#60A5FA' : '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setCustomTotalHours(null)}
              title="Restablecer valor calculado"
            >
              ↺
            </button>
          </div>
        </div>
      </section>

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-4 items-start">
        <div style={styles.leftCard}>
          <div style={cards.cardHeader}>
            <strong>Disponibilidad</strong>
            <span style={{ color: isDark ? '#999' : '#777', fontSize: 13 }}>
              {' '}
              (Periodo seleccionado)
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 18,
              alignItems: 'center',
              padding: 16,
              flexWrap: 'wrap',
            }}
          >
            <Gauge value={Math.max(0, Math.min(100, dispResult.dispo))} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontSize: 14,
                  color: isDark ? '#AAA' : '#666',
                  marginBottom: 8,
                }}
              >
                Resumen
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 10,
                }}
              >
                <div style={cards.statBox}>
                  <div style={cards.statLabel}>Downtime (hrs)</div>
                  <div style={cards.statValue}>
                    {prettyNumber(dispResult.downtimeHours)}
                  </div>
                </div>
                <div style={cards.statBox}>
                  <div style={cards.statLabel}>DISP (%)</div>
                  <div style={cards.statValue}>
                    {prettyNumber(dispResult.dispo)}
                  </div>
                </div>
                <div style={cards.statBox}>
                  <div style={cards.statLabel}>Órdenes afectadas</div>
                  <div style={cards.statValue}>
                    {new Set(dispResult.details.map((d) => d.otId)).size}
                  </div>
                </div>
                <div style={cards.statBox}>
                  <div style={cards.statLabel}>Días en rango</div>
                  <div style={cards.statValue}>{dailyTrend.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.rightCard}>
          <div style={cards.cardHeader}>
            <strong>Tendencia diaria de DISP</strong>
            <span
              style={{
                color: isDark ? '#999' : '#777',
                fontSize: 13,
                marginLeft: 8,
              }}
            >
              {' '}
              (por día)
            </span>
          </div>
          <div style={{ height: 300, padding: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => d.slice(5)}
                  tick={axisTick}
                />
                <YAxis domain={[0, 100]} tick={axisTick} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => `${Number(value).toFixed(2)} %`}
                />
                <Line
                  type="monotone"
                  dataKey="disp"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      <section style={{ marginTop: 16 }}>
        <div style={cards.cardHeader}>
          <strong>Detalles de downtime (registros)</strong>
        </div>
        <div
          style={{
            marginTop: 8,
            borderRadius: 8,
            overflowX: 'auto',
            border: `1px solid ${isDark ? '#3A3A3A' : '#eee'}`,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead
              style={{
                background: isDark ? '#2A2A2A' : '#fafafa',
                borderBottom: `1px solid ${isDark ? '#3A3A3A' : '#eee'}`,
              }}
            >
              <tr>
                <th style={tableS.th}>Fecha</th>
                <th style={tableS.th}>Orden</th>
                <th style={tableS.th}>Inicio</th>
                <th style={tableS.th}>Fin</th>
                <th style={tableS.th}>Dur (hrs)</th>
                <th style={tableS.th}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {dispResult.details.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 18,
                      textAlign: 'center',
                      color: isDark ? '#999' : '#888',
                    }}
                  >
                    No hay registros en este rango
                  </td>
                </tr>
              )}
              {dispResult.details.map((d) => {
                const mins = minutesBetween(d.horaInicio, d.horaFin);
                const hrs = mins / 60;
                return (
                  <tr key={d.id}>
                    <td style={tableS.td}>{d.fecha}</td>
                    <td style={tableS.td}>{d.otId}</td>
                    <td style={tableS.td}>{d.horaInicio}</td>
                    <td style={tableS.td}>{d.horaFin}</td>
                    <td style={tableS.td}>{hrs.toFixed(2)}</td>
                    <td style={tableS.td}>{d.observaciones ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* === Ranking DISP por activo === */}
      <section style={{ marginTop: 32 }}>
        <div style={cards.cardHeader}>
          <strong>Ranking de Disponibilidad (DISP) por Activo</strong>
          <RankingTable
            machines={machines}
            from={from}
            to={to}
            allDetails={allDetails}
            allOTs={allOTs}
          />
        </div>
      </section>
    </div>
  );
}

// ── RankingTable sub-component ────────────────────────────────────────────────

type RankingTableProps = {
  machines: Maquina[];
  from: string;
  to: string;
  allDetails: WorkDetail[];
  allOTs: OT[];
};

function RankingTable({
  machines,
  from,
  to,
  allDetails,
  allOTs,
}: RankingTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tableS = getTableStyles(isDark);

  const [sortAsc, setSortAsc] = useState(false);
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);

  useEffect(() => {
    setLocalFrom(from);
    setLocalTo(to);
  }, [from, to]);

  const ranking = useMemo(() => {
    return machines.map((m) => {
      const res = computeDispForAsset(
        m,
        localFrom,
        localTo,
        allDetails,
        allOTs,
      );
      return {
        id: m.id,
        nombre: m.name,
        dispo: Number(res.dispo.toFixed(2)),
        downtime: Number(res.downtimeHours.toFixed(2)),
        total: Number(res.totalHours.toFixed(2)),
      };
    });
  }, [machines, localFrom, localTo, allDetails, allOTs]);

  const sorted = useMemo(
    () =>
      [...ranking].sort((a, b) =>
        sortAsc ? a.dispo - b.dispo : b.dispo - a.dispo,
      ),
    [ranking, sortAsc],
  );

  const exportarExcel = () => {
    const data = sorted.map((row, i) => ({
      '#': i + 1,
      Activo: row.nombre,
      'Downtime (hrs)': row.downtime,
      'Total (hrs)': row.total,
      'DISP (%)': row.dispo,
    }));
    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Ranking DISP');
    XLSX.writeFile(libro, 'ranking_disponibilidad.xlsx');
  };

  return (
    <div
      style={{
        marginTop: 8,
        borderRadius: 8,
        overflowX: 'auto',
        border: `1px solid ${isDark ? '#3A3A3A' : '#eee'}`,
      }}
    >
      <div
        style={{
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 500, color: isDark ? '#DDD' : '#333' }}>
          Rango para ranking:
        </span>
        <DateRangePicker
          from={localFrom}
          to={localTo}
          onChange={(f, t) => {
            if (new Date(f) > new Date(t)) return;
            setLocalFrom(f);
            setLocalTo(t);
          }}
        />
        <button
          onClick={exportarExcel}
          style={{
            marginLeft: 'auto',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          Exportar a Excel
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead
          style={{
            background: isDark ? '#2A2A2A' : '#fafafa',
            borderBottom: `1px solid ${isDark ? '#3A3A3A' : '#eee'}`,
          }}
        >
          <tr>
            <th style={tableS.th}>#</th>
            <th style={tableS.th}>Activo</th>
            <th style={tableS.th}>Downtime (hrs)</th>
            <th style={tableS.th}>Total (hrs)</th>
            <th style={tableS.th}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#60A5FA' : '#2563eb',
                  fontWeight: 700,
                }}
                onClick={() => setSortAsc((v) => !v)}
                title="Ordenar por DISP"
              >
                DISP (%) {sortAsc ? '▲' : '▼'}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.id}
              style={{
                background: isDark
                  ? i % 2 === 0
                    ? '#1D1D1D'
                    : '#232323'
                  : i % 2 === 0
                    ? '#fff'
                    : '#f8fafc',
              }}
            >
              <td style={tableS.td}>{i + 1}</td>
              <td style={tableS.td}>{row.nombre}</td>
              <td style={tableS.td}>{row.downtime}</td>
              <td style={tableS.td}>{row.total}</td>
              <td style={tableS.td}>{row.dispo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ====== Estilos (theme-aware) ====== */
function getPageStyles(isDark: boolean) {
  return {
    wrapper: {
      padding: 20,
      fontFamily:
        "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
      color: isDark ? '#F5F5F5' : '#0f172a',
    },
    header: { marginBottom: 18 },
    controls: {
      display: 'flex' as const,
      gap: 16,
      alignItems: 'center' as const,
      marginBottom: 12,
      flexWrap: 'wrap' as const,
    },
    label: { fontSize: 12, color: isDark ? '#AAA' : '#666', marginBottom: 6 },
    select: {
      padding: '8px 10px',
      borderRadius: 8,
      border: `1px solid ${isDark ? '#3A3A3A' : '#ddd'}`,
      background: isDark ? '#2A2A2A' : '#fff',
      color: isDark ? '#F5F5F5' : '#0f172a',
      minWidth: 220,
    },
    leftCard: {
      background: isDark ? '#232323' : '#fff',
      borderRadius: 12,
      boxShadow: isDark
        ? '0 4px 18px rgba(0,0,0,0.35)'
        : '0 4px 18px rgba(12, 17, 43, 0.06)',
      overflow: 'hidden',
    },
    rightCard: {
      background: isDark ? '#232323' : '#fff',
      borderRadius: 12,
      boxShadow: isDark
        ? '0 4px 18px rgba(0,0,0,0.35)'
        : '0 4px 18px rgba(12,17,43,0.06)',
      overflow: 'hidden',
    },
  };
}

function getCardStyles(isDark: boolean) {
  return {
    cardHeader: {
      padding: '14px 18px',
      borderBottom: `1px solid ${isDark ? '#3A3A3A' : '#f0f2f7'}`,
      background: isDark
        ? 'linear-gradient(180deg,#232323,#1F1F1F)'
        : 'linear-gradient(180deg,#fff,#fbfdff)',
      color: isDark ? '#F5F5F5' : '#0f172a',
      fontSize: 15,
    },
    statBox: {
      padding: 12,
      background: isDark ? '#1D1D1D' : '#fbfcfe',
      borderRadius: 8,
      boxShadow: isDark
        ? 'inset 0 0 0 1px rgba(255,255,255,0.06)'
        : 'inset 0 0 0 1px rgba(7,11,27,0.02)',
    },
    statLabel: { fontSize: 12, color: isDark ? '#AAA' : '#666' },
    statValue: {
      fontSize: 18,
      fontWeight: 700,
      marginTop: 6,
      color: isDark ? '#F5F5F5' : '#0f172a',
    },
  };
}

function getTableStyles(isDark: boolean) {
  return {
    th: {
      textAlign: 'left' as const,
      padding: '10px 12px',
      fontSize: 13,
      color: isDark ? '#CCC' : '#444',
    },
    td: {
      padding: '10px 12px',
      borderTop: `1px solid ${isDark ? '#2E2E2E' : '#f6f7fb'}`,
      fontSize: 13,
      color: isDark ? '#E5E5E5' : '#1a1a1a',
    },
  };
}
