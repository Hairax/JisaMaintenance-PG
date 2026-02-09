// src/pages/KPI_DISP.tsx
import React, { useMemo, useState, useEffect } from 'react';
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
import {
  maquinas,
  ordenes,
  informeDetalles,
  Maquina,
  InformeDetalleTrabajo,
} from './mockData';

/**
 * Helpers de fecha/hora (sin librerías)
 */
function toDateYMD(s: string) {
  // s like "2025-08-04" or "2025-08-04T10:00:00"
  return new Date(s);
}

function parseTimeToMinutes(timeHHMM: string) {
  const [h, m] = timeHHMM.split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesBetweenDates(
  dateYMD: string,
  startHHMM: string,
  endHHMM: string,
) {
  // asumimos mismo día
  const startMin = parseTimeToMinutes(startHHMM);
  const endMin = parseTimeToMinutes(endHHMM);
  const diff = endMin - startMin;
  return diff > 0 ? diff : 0;
}

function formatPercent(v: number) {
  return `${v.toFixed(1)}%`;
}

/**
 * Componente Gauge (simple, elegante)
 */
function Gauge({ value }: { value: number }) {
  // value entre 0-100
  const angle = (value / 100) * 180; // semicircle
  const radius = 90;
  const cx = 100;
  const cy = 100;
  const startAngle = 180;
  const endAngle = 180 - angle;
  // stroke-dash trick
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
          stroke="#e6e9ef"
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
          fill="#111"
          fontWeight={700}
        >
          DISP
        </text>
        <text
          x="100"
          y="96"
          textAnchor="middle"
          fontSize="20"
          fill="#111"
          fontWeight={700}
        >
          {formatPercent(value)}
        </text>
      </svg>
    </div>
  );
}

/**
 * Calcula DIS P para un activo en un rango de fechas
 * - totalHorasPeriodo = (to - from + 1 day) * 24
 * - downtime = suma de minutos de informeDetalles para órdenes de la máquina dentro del rango
 */
function computeDispForAsset(
  maquina: Maquina,
  fromISO: string,
  toISO: string,
  allDetalles: InformeDetalleTrabajo[],
  allOrdenes: any[],
) {
  const fromDate = new Date(fromISO + 'T00:00:00');
  const toDate = new Date(toISO + 'T23:59:59');
  const msInHour = 1000 * 60 * 60;
  const totalHours =
    Math.max((toDate.getTime() - fromDate.getTime()) / msInHour, 0.0) || 0;

  // Obtener ordenes de esta maquina
  const ordenIdsForMaquina = allOrdenes
    .filter((o: any) => o.maquina_id === maquina.id)
    .map((o: any) => o.id);

  // Filtrar detalles dentro del rango y de las órdenes de la máquina
  const detalles = allDetalles.filter((d) => {
    const fecha = new Date(d.fechaTrabajo + 'T00:00:00');
    return (
      fecha >= fromDate &&
      fecha <= toDate &&
      ordenIdsForMaquina.includes(d.ordenTrabajo_id)
    );
  });

  // sumar minutos
  const totalMinutesDown = detalles.reduce((acc, d) => {
    return acc + minutesBetweenDates(d.fechaTrabajo, d.horaInicio, d.horaFin);
  }, 0);

  const downtimeHours = totalMinutesDown / 60;

  const dispo =
    totalHours > 0 ? ((totalHours - downtimeHours) / totalHours) * 100 : 0;

  return {
    totalHours,
    downtimeHours,
    dispo,
    detalles,
  };
}

/**
 * Construye tendencia diaria de DISP en rango (cada día de from..to)
 */
function buildDailyTrend(
  maquina: Maquina,
  fromISO: string,
  toISO: string,
  allDetalles: InformeDetalleTrabajo[],
  allOrdenes: any[],
) {
  const from = new Date(fromISO + 'T00:00:00');
  const to = new Date(toISO + 'T00:00:00');
  const days: { date: string; disp: number }[] = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dayStr = d.toISOString().slice(0, 10);
    const res = computeDispForAsset(
      maquina,
      dayStr,
      dayStr,
      allDetalles,
      allOrdenes,
    );
    days.push({ date: dayStr, disp: Number(res.dispo.toFixed(2)) });
  }
  return days;
}

export default function KPI_DISP_Page() {
  // mock inicial: puedes reemplazar con fetch a tu backend y setear estos estados
  const [machines] = useState(maquinas);
  const [ordenesAll] = useState(ordenes);
  const [detallesAll] = useState(informeDetalles);

  // seleccionado
  const [selectedMachineId, setSelectedMachineId] = useState<number>(
    machines[0]?.id ?? 0,
  );

  // establecer rango por defecto: desde fechaCreacion de la máquina seleccionada hasta hoy
  const selectedMachine = machines.find((m) => m.id === selectedMachineId)!;
  const today = new Date();
  const defaultFrom = selectedMachine
    ? selectedMachine.fechaCreacion
    : new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today.toISOString().slice(0, 10));

  // actualizar defaultFrom cuando cambie la máquina seleccionada
  useEffect(() => {
    if (selectedMachine) {
      const newFrom = selectedMachine.fechaCreacion;
      setFrom(newFrom);
      // keep 'to' as today
      setTo(new Date().toISOString().slice(0, 10));
    }
  }, [selectedMachineId]); // eslint-disable-line

  // Permitir personalizar el tiempo disponible
  const [customTotalHours, setCustomTotalHours] = useState<string | null>(null);

  // cálculos memoizados
  const dispResult = useMemo(() => {
    const m = machines.find((x) => x.id === selectedMachineId)!;
    if (!m)
      return {
        totalHours: 0,
        downtimeHours: 0,
        dispo: 0,
        detalles: [] as InformeDetalleTrabajo[],
      };
    const base = computeDispForAsset(m, from, to, detallesAll, ordenesAll);
    // Si hay un valor personalizado, usarlo
    let totalHours = base.totalHours;
    if (customTotalHours !== null && customTotalHours !== '') {
      const parsed = parseFloat(customTotalHours.replace(/,/g, '.'));
      if (!isNaN(parsed) && parsed > 0) {
        totalHours = parsed;
      }
    }
    const dispo =
      totalHours > 0
        ? ((totalHours - base.downtimeHours) / totalHours) * 100
        : 0;
    return {
      ...base,
      totalHours,
      dispo,
    };
  }, [
    selectedMachineId,
    from,
    to,
    machines,
    detallesAll,
    ordenesAll,
    customTotalHours,
  ]);

  const dailyTrend = useMemo(() => {
    const m = machines.find((x) => x.id === selectedMachineId)!;
    if (!m) return [];
    return buildDailyTrend(m, from, to, detallesAll, ordenesAll);
  }, [selectedMachineId, from, to, machines, detallesAll, ordenesAll]);

  // formato bonito
  const prettyNumber = (n: number) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div style={pageStyles.wrapper}>
      <header style={pageStyles.header}>
        <h2 style={{ margin: 0 }}>KPI — Disponibilidad (DISP) por Activo</h2>
        <p style={{ margin: '6px 0 0', color: '#666' }}>
          Selecciona un activo y rango de fechas para ver DISP (tiempo operativo
          vs downtime desde órdenes/informes).
        </p>
      </header>

      <section style={pageStyles.controls}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={pageStyles.label}>Activo</label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(Number(e.target.value))}
              style={pageStyles.select}
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.descripcion}
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
          <div style={{ color: '#444', fontSize: 12 }}>Periodo total (hrs)</div>
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
                border: '1px solid #ddd',
                background: '#fff',
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
                color: '#2563eb',
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

      <main style={pageStyles.main}>
        <div style={pageStyles.leftCard}>
          <div style={cardStyles.cardHeader}>
            <strong>Disponibilidad</strong>
            <span style={{ color: '#777', fontSize: 13 }}>
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
            }}
          >
            <Gauge value={Math.max(0, Math.min(100, dispResult.dispo))} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                Resumen
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <div style={cardStyles.statBox}>
                  <div style={cardStyles.statLabel}>Downtime (hrs)</div>
                  <div style={cardStyles.statValue}>
                    {prettyNumber(dispResult.downtimeHours)}
                  </div>
                </div>
                <div style={cardStyles.statBox}>
                  <div style={cardStyles.statLabel}>DISP (%)</div>
                  <div style={cardStyles.statValue}>
                    {prettyNumber(dispResult.dispo)}
                  </div>
                </div>
                <div style={cardStyles.statBox}>
                  <div style={cardStyles.statLabel}>Órdenes afectadas</div>
                  <div style={cardStyles.statValue}>
                    {
                      new Set(dispResult.detalles.map((d) => d.ordenTrabajo_id))
                        .size
                    }
                  </div>
                </div>
                <div style={cardStyles.statBox}>
                  <div style={cardStyles.statLabel}>Días en rango</div>
                  <div style={cardStyles.statValue}>{dailyTrend.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={pageStyles.rightCard}>
          <div style={cardStyles.cardHeader}>
            <strong>Tendencia diaria de DISP</strong>
            <span style={{ color: '#777', fontSize: 13, marginLeft: 8 }}>
              {' '}
              (por día)
            </span>
          </div>
          <div style={{ height: 300, padding: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: any) => `${Number(value).toFixed(2)} %`}
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
        <div style={cardStyles.cardHeader}>
          <strong>Detalles de downtime (registros)</strong>
        </div>
        <div
          style={{
            marginTop: 8,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid #eee',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead
              style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}
            >
              <tr>
                <th style={tableStyles.th}>Fecha</th>
                <th style={tableStyles.th}>Orden</th>
                <th style={tableStyles.th}>Inicio</th>
                <th style={tableStyles.th}>Fin</th>
                <th style={tableStyles.th}>Dur (hrs)</th>
                <th style={tableStyles.th}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {dispResult.detalles.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: 18, textAlign: 'center', color: '#888' }}
                  >
                    No hay registros en este rango
                  </td>
                </tr>
              )}
              {dispResult.detalles.map((d: any) => {
                const mins = minutesBetweenDates(
                  d.fechaTrabajo,
                  d.horaInicio,
                  d.horaFin,
                );
                const hrs = mins / 60;
                return (
                  <tr key={d.id}>
                    <td style={tableStyles.td}>{d.fechaTrabajo}</td>
                    <td style={tableStyles.td}>{d.ordenTrabajo_id}</td>
                    <td style={tableStyles.td}>{d.horaInicio}</td>
                    <td style={tableStyles.td}>{d.horaFin}</td>
                    <td style={tableStyles.td}>{hrs.toFixed(2)}</td>
                    <td style={tableStyles.td}>{d.descripcionLabor ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* === Ranking DISP por activo === */}
      <section style={{ marginTop: 32 }}>
        <div style={cardStyles.cardHeader}>
          <strong>Ranking de Disponibilidad (DISP) por Activo</strong>
          <RankingTable
            machines={machines}
            from={from}
            to={to}
            detallesAll={detallesAll}
            ordenesAll={ordenesAll}
          />
        </div>
      </section>
    </div>
  );
}

// Tabla de ranking de DISP por activo
// (no agregar import duplicado de React ni hooks)

type RankingTableProps = {
  machines: any[];
  from: string;
  to: string;
  detallesAll: any[];
  ordenesAll: any[];
};

function RankingTable(props: RankingTableProps) {
  const { machines, from, to, detallesAll, ordenesAll } = props;
  const [sortAsc, setSortAsc] = React.useState(false);
  // Estado local de rango para el ranking
  const [localFrom, setLocalFrom] = React.useState(from);
  const [localTo, setLocalTo] = React.useState(to);

  // Si cambian los props de from/to, sincronizar el rango local solo si el usuario no lo ha cambiado manualmente
  React.useEffect(() => {
    setLocalFrom(from);
    setLocalTo(to);
  }, [from, to]);

  // Calcular DISP para cada máquina en el rango local
  const ranking = React.useMemo(() => {
    return machines.map((m) => {
      const res = computeDispForAsset(
        m,
        localFrom,
        localTo,
        detallesAll,
        ordenesAll,
      );
      return {
        id: m.id,
        descripcion: m.descripcion,
        dispo: Number(res.dispo.toFixed(2)),
        downtime: Number(res.downtimeHours.toFixed(2)),
        total: Number(res.totalHours.toFixed(2)),
      };
    });
  }, [machines, localFrom, localTo, detallesAll, ordenesAll]);

  // Ordenar
  const sorted = React.useMemo(() => {
    return [...ranking].sort((a, b) =>
      sortAsc ? a.dispo - b.dispo : b.dispo - a.dispo,
    );
  }, [ranking, sortAsc]);

  // Exportar ranking a Excel
  const exportarExcel = () => {
    const datosParaExportar = sorted.map((row, i) => ({
      '#': i + 1,
      Activo: row.descripcion,
      'Downtime (hrs)': row.downtime,
      'Total (hrs)': row.total,
      'DISP (%)': row.dispo,
    }));
    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Ranking DISP');
    XLSX.writeFile(libro, 'ranking_disponibilidad.xlsx');
  };

  return (
    <div
      style={{
        marginTop: 8,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid #eee',
      }}
    >
      <div
        style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}
      >
        <span style={{ fontWeight: 500, color: '#333' }}>
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
          style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}
        >
          <tr>
            <th style={tableStyles.th}>#</th>
            <th style={tableStyles.th}>Activo</th>
            <th style={tableStyles.th}>Downtime (hrs)</th>
            <th style={tableStyles.th}>Total (hrs)</th>
            <th style={tableStyles.th}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#2563eb',
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
              style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}
            >
              <td style={tableStyles.td}>{i + 1}</td>
              <td style={tableStyles.td}>{row.descripcion}</td>
              <td style={tableStyles.td}>{row.downtime}</td>
              <td style={tableStyles.td}>{row.total}</td>
              <td style={tableStyles.td}>{row.dispo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ====== Estilos simples (puedes mover a CSS) ====== */
const pageStyles = {
  wrapper: {
    padding: 20,
    fontFamily:
      "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
    color: '#0f172a',
  },
  header: { marginBottom: 18 },
  controls: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  select: {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #ddd',
    minWidth: 220,
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '1fr 480px',
    gap: 16,
    alignItems: 'start',
  },
  leftCard: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 18px rgba(12, 17, 43, 0.06)',
    overflow: 'hidden',
  },
  rightCard: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 18px rgba(12,17,43,0.06)',
    overflow: 'hidden',
  },
};

const cardStyles = {
  cardHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #f0f2f7',
    background: 'linear-gradient(180deg,#fff,#fbfdff)',
    fontSize: 15,
  },
  statBox: {
    padding: 12,
    background: '#fbfcfe',
    borderRadius: 8,
    boxShadow: 'inset 0 0 0 1px rgba(7,11,27,0.02)',
  },
  statLabel: { fontSize: 12, color: '#666' },
  statValue: { fontSize: 18, fontWeight: 700, marginTop: 6 },
};

const tableStyles = {
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    fontSize: 13,
    color: '#444',
  },
  td: { padding: '10px 12px', borderTop: '1px solid #f6f7fb', fontSize: 13 },
};
