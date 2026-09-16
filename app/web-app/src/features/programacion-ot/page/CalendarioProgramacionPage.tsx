import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import {
  programacionOtService,
  OcurrenciaProgramacion,
} from '../services/programacionOt.service';
import { API_URL } from '../../../shared/config/api';

const API = API_URL;

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  Preventivo: { bg: '#E3F2FD', color: '#1565C0' },
  Correctivo: { bg: '#FFEBEE', color: '#C62828' },
  Predictivo: { bg: '#F3E5F5', color: '#6A1B9A' },
};

function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Genera la grilla del mes visible: días del mes anterior/siguiente que
// completan la primera y última semana, más los del mes actual.
function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0 = domingo
  const gridStart = new Date(year, month, 1 - startOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(
      new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + i,
      ),
    );
  }
  return days;
}

export default function CalendarioProgramacionPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const textColor = isDark ? colors.lightText : colors.darkText;
  const secondaryTextColor = isDark ? colors.beige : colors.brown;
  const bgColor = isDark ? colors.darkBg : colors.lightBg;
  const cardBg = isDark ? '#232323' : '#FFFFFF';
  const borderColor = isDark ? '#3A3A3A' : '#D6D6D6';
  const todayBg = isDark ? `${colors.gold}25` : `${colors.gold}20`;
  const outsideMonthColor = isDark ? '#555' : '#BBB';

  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [ocurrencias, setOcurrencias] = useState<OcurrenciaProgramacion[]>([]);
  const [maquinaNombres, setMaquinaNombres] = useState<Record<number, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const desde = formatDateOnly(grid[0]);
      const hasta = formatDateOnly(grid[grid.length - 1]);
      const [ocs, maqsRes] = await Promise.all([
        programacionOtService.getOcurrencias(desde, hasta),
        fetch(`${API}/maquinas`).then((r) => (r.ok ? r.json() : [])),
      ]);
      setOcurrencias(ocs);
      const maqs = Array.isArray(maqsRes) ? maqsRes : [];
      setMaquinaNombres(
        Object.fromEntries(
          maqs.map((m: { id: number; name?: string; nombre?: string }) => [
            m.id,
            m.name || m.nombre || `Máquina #${m.id}`,
          ]),
        ),
      );
    } catch (err) {
      console.error(err);
      setError('Error al cargar el calendario de mantenimientos.');
    } finally {
      setLoading(false);
    }
  }, [grid]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const ocurrenciasPorDia = useMemo(() => {
    const map: Record<string, OcurrenciaProgramacion[]> = {};
    for (const o of ocurrencias) {
      if (!map[o.fecha]) map[o.fecha] = [];
      map[o.fecha].push(o);
    }
    return map;
  }, [ocurrencias]);

  const irMesAnterior = () => setCursor(new Date(year, month - 1, 1));
  const irMesSiguiente = () => setCursor(new Date(year, month + 1, 1));
  const irHoy = () =>
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  const ocurrenciasDelDiaSeleccionado = selectedDay
    ? (ocurrenciasPorDia[formatDateOnly(selectedDay)] ?? [])
    : [];

  return (
    <div
      style={{ backgroundColor: bgColor, minHeight: '100vh', padding: '20px' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/programacion-ot')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: secondaryTextColor,
                cursor: 'pointer',
                fontSize: '13px',
                padding: '6px 8px',
              }}
            >
              <FaArrowLeft /> Programaciones
            </button>
            <h1
              style={{
                color: secondaryTextColor,
                margin: 0,
                fontSize: '1.4rem',
              }}
            >
              Calendario de Mantenimientos
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={irMesAnterior}
              aria-label="Mes anterior"
              style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                color: textColor,
                borderRadius: '6px',
                width: '34px',
                height: '34px',
                cursor: 'pointer',
              }}
            >
              <FaChevronLeft />
            </button>
            <div
              style={{
                minWidth: '160px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: textColor,
              }}
            >
              {MESES[month]} {year}
            </div>
            <button
              onClick={irMesSiguiente}
              aria-label="Mes siguiente"
              style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                color: textColor,
                borderRadius: '6px',
                width: '34px',
                height: '34px',
                cursor: 'pointer',
              }}
            >
              <FaChevronRight />
            </button>
            <button
              onClick={irHoy}
              style={{
                background: colors.gold,
                border: 'none',
                color: colors.darkText,
                borderRadius: '6px',
                padding: '8px 14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
            >
              Hoy
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#E53E3E',
              color: '#FFF',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{ textAlign: 'center', padding: '60px', color: textColor }}
          >
            Cargando calendario...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
                minWidth: '840px',
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {DIAS_SEMANA.map((d) => (
                <div
                  key={d}
                  style={{
                    background: isDark ? colors.brown : colors.gold,
                    color: isDark ? colors.lightText : colors.darkText,
                    padding: '10px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'center',
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  {d}
                </div>
              ))}

              {grid.map((day) => {
                const inMonth = day.getMonth() === month;
                const isToday = sameDay(day, today);
                const eventos = ocurrenciasPorDia[formatDateOnly(day)] ?? [];
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => eventos.length > 0 && setSelectedDay(day)}
                    style={{
                      backgroundColor: isToday ? todayBg : cardBg,
                      minHeight: '110px',
                      padding: '6px',
                      borderRight: `1px solid ${borderColor}`,
                      borderBottom: `1px solid ${borderColor}`,
                      cursor: eventos.length > 0 ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: inMonth ? textColor : outsideMonthColor,
                      }}
                    >
                      {day.getDate()}
                    </span>
                    {eventos.slice(0, 3).map((ev, i) => {
                      const c = TIPO_COLORS[ev.tipoEjecucion] ?? {
                        bg: isDark ? `${colors.brown}40` : `${colors.beige}80`,
                        color: secondaryTextColor,
                      };
                      return (
                        <div
                          key={`${ev.programacionId}-${i}`}
                          style={{
                            background: c.bg,
                            color: c.color,
                            fontSize: '11px',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={`${maquinaNombres[ev.maquina_id] ?? `Máquina #${ev.maquina_id}`} — ${ev.descripcionTarea}`}
                        >
                          {maquinaNombres[ev.maquina_id] ??
                            `Máq. #${ev.maquina_id}`}
                        </div>
                      );
                    })}
                    {eventos.length > 3 && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: secondaryTextColor,
                          fontWeight: 'bold',
                        }}
                      >
                        +{eventos.length - 3} más
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p
          style={{
            color: secondaryTextColor,
            fontSize: '12px',
            marginTop: '12px',
          }}
        >
          Se muestran las fechas en que cada programación activa generará (o
          generó) una orden de trabajo. Las programaciones inactivas no aparecen
          acá.
        </p>
      </div>

      {/* Modal día seleccionado */}
      {selectedDay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedDay(null)}
        >
          <div
            style={{
              backgroundColor: cardBg,
              color: textColor,
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '480px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              border: `1px solid ${borderColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: secondaryTextColor }}>
              {selectedDay.toLocaleDateString('es-BO', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            {ocurrenciasDelDiaSeleccionado.map((ev, i) => {
              const c = TIPO_COLORS[ev.tipoEjecucion] ?? {
                bg: isDark ? `${colors.brown}40` : `${colors.beige}80`,
                color: secondaryTextColor,
              };
              return (
                <div
                  key={`${ev.programacionId}-${i}`}
                  style={{
                    border: `1px solid ${borderColor}`,
                    borderRadius: '6px',
                    padding: '10px 12px',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <strong>
                      {maquinaNombres[ev.maquina_id] ??
                        `Máquina #${ev.maquina_id}`}
                    </strong>
                    <span
                      style={{
                        background: c.bg,
                        color: c.color,
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {ev.tipoEjecucion}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px' }}>
                    {ev.descripcionTarea}
                  </p>
                </div>
              );
            })}
            <button
              onClick={() => setSelectedDay(null)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: colors.gold,
                color: colors.darkText,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '8px',
                fontWeight: 'bold',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
