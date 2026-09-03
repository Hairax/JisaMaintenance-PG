import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { minutosTrabajados } from '../../../shared/utils/laborCost';
import { API_URL } from '../../../shared/config/api';

const API = API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Repuesto {
  id: number;
  nombre: string;
  cantidad: number;
  stockCritico: number;
}

interface OT {
  id: number;
  descripcionTarea: string;
  estado: string;
  fechaHora: string;
  fechaCreacion: string;
  tiempoEstimado?: number;
  tecnicos?: number[];
  maquina?: { id?: number; name?: string; nombre?: string };
  supervisor?: { id?: number; name?: string; lastName?: string };
  tipoOT?: { nombre?: string; name?: string };
}

interface InformeDetalle {
  id: number;
  otId: number;
  horaInicio: string;
  horaFinalización: string;
}

interface Informe {
  id: number;
  userId: number;
  detalles: InformeDetalle[];
}

interface ProgramacionOt {
  id: number;
  nombre?: string;
  descripcionTarea: string;
  proximaEjecucion: string;
  activo: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getMaquinaNombre = (ot: OT) =>
  ot.maquina?.name ?? ot.maquina?.nombre ?? '—';

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const ESTADO_COLORS: Record<string, { bg: string; color: string }> = {
  Abierta: { bg: '#E3F2FD', color: '#1565C0' },
  'En Progreso Técnico': { bg: '#FFF3E0', color: '#E65100' },
  'En Progreso Almacén': { bg: '#F3E5F5', color: '#6A1B9A' },
  Cerrada: { bg: '#E8F5E9', color: '#2E7D32' },
};

const saludoPorHora = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const CARGO_LABEL: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
  externo: 'Externo',
};

export const HomePage = () => {
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [criticalRepuestos, setCriticalRepuestos] = useState<Repuesto[]>([]);
  const [ots, setOts] = useState<OT[]>([]);
  const [informes, setInformes] = useState<Informe[]>([]);
  const [proximaProgramacion, setProximaProgramacion] =
    useState<ProgramacionOt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resRepuestos, resOts, resInformes, resProg] = await Promise.all([
          fetch(`${API}/repuestos`),
          fetch(`${API}/ots`),
          fetch(`${API}/informes`),
          fetch(`${API}/programaciones-ot`),
        ]);

        const [repuestos, otsData, informesData, progData] = (await Promise.all(
          [
            resRepuestos.ok ? resRepuestos.json() : [],
            resOts.ok ? resOts.json() : [],
            resInformes.ok ? resInformes.json() : [],
            resProg.ok ? resProg.json() : [],
          ],
        )) as [Repuesto[], OT[], Informe[], ProgramacionOt[]];

        setCriticalRepuestos(
          (Array.isArray(repuestos) ? repuestos : []).filter(
            (r) => r.stockCritico != null && r.cantidad <= r.stockCritico,
          ),
        );
        setOts(Array.isArray(otsData) ? otsData : []);
        setInformes(Array.isArray(informesData) ? informesData : []);

        const proximas = (Array.isArray(progData) ? progData : [])
          .filter((p) => p.activo)
          .sort((a, b) => a.proximaEjecucion.localeCompare(b.proximaEjecucion));
        setProximaProgramacion(proximas[0] ?? null);
      } catch (err) {
        console.error('Error al cargar datos de inicio:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Horas trabajadas por OT, a partir de los informes diarios.
  const horasPorOT = useMemo(() => {
    const map: Record<number, number> = {};
    for (const inf of informes) {
      for (const det of inf.detalles ?? []) {
        const otId = Number(det.otId);
        const minutos = minutosTrabajados(
          det.horaInicio,
          det['horaFinalización' as keyof typeof det] as unknown as string,
        );
        map[otId] = (map[otId] ?? 0) + minutos / 60;
      }
    }
    return map;
  }, [informes]);

  const misOts = useMemo(
    () =>
      user ? ots.filter((ot) => (ot.tecnicos ?? []).includes(user.id)) : [],
    [ots, user],
  );
  const misPendientes = useMemo(
    () => misOts.filter((ot) => ot.estado !== 'Cerrada'),
    [misOts],
  );
  const misCompletadas = useMemo(
    () => misOts.filter((ot) => ot.estado === 'Cerrada'),
    [misOts],
  );
  const superviso = useMemo(
    () =>
      user
        ? ots.filter(
            (ot) => ot.supervisor?.id === user.id && ot.estado !== 'Cerrada',
          )
        : [],
    [ots, user],
  );

  const esVencida = useCallback(
    (ot: OT) =>
      ot.tiempoEstimado != null &&
      ot.tiempoEstimado > 0 &&
      (horasPorOT[ot.id] ?? 0) > ot.tiempoEstimado,
    [horasPorOT],
  );

  const vencidas = useMemo(
    () =>
      [...misOts, ...superviso].filter(
        (ot, i, arr) =>
          ot.estado !== 'Cerrada' &&
          esVencida(ot) &&
          arr.findIndex((o) => o.id === ot.id) === i,
      ),
    [misOts, superviso, esVencida],
  );

  const cargoLabel = user ? (CARGO_LABEL[user.cargo] ?? user.cargo) : '';
  const esGerencial = user?.cargo === 'admin' || user?.cargo === 'supervisor';

  const cardBase = `rounded-xl p-4 shadow-sm border ${isDark ? 'bg-[#1D1D1D] border-[#2A2A2A]' : 'bg-white border-gray-100'}`;

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? 'bg-[#0F090C]' : 'bg-[#F9FAFB]'}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Encabezado / Bienvenida ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div>
            <h1
              className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {saludoPorHora()}, {user?.name ?? 'Usuario'} 👋
            </h1>
            <p
              className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {cargoLabel && <span className="font-medium">{cargoLabel}</span>}
              {cargoLabel && ' · '}
              {new Date().toLocaleDateString('es-BO', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {esGerencial && (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-md text-sm font-semibold"
                style={{ background: '#FBAF11', color: '#1A1A1A' }}
              >
                Ver Panel Gerencial →
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {loading ? (
          <div
            className={`text-center py-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Cargando tu panel...
          </div>
        ) : (
          <>
            {/* ── Mis KPIs ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                {
                  label: 'OTs Asignadas',
                  value: misOts.length,
                  color: '#1565C0',
                  icon: '📋',
                },
                {
                  label: 'Completadas',
                  value: misCompletadas.length,
                  color: '#2E7D32',
                  icon: '✅',
                },
                {
                  label: 'Pendientes',
                  value: misPendientes.length,
                  color: '#E65100',
                  icon: '⏳',
                },
                {
                  label: 'Vencidas (tiempo)',
                  value: vencidas.length,
                  color: '#C62828',
                  icon: '🚨',
                },
                {
                  label: 'Superviso (abiertas)',
                  value: superviso.length,
                  color: '#6A1B9A',
                  icon: '🧭',
                },
              ].map((k) => (
                <div key={k.label} className={cardBase}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{k.icon}</span>
                    <span
                      className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {k.label}
                    </span>
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: k.color }}
                  >
                    {k.value}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Alerta de OTs vencidas por tiempo ────────────────────────── */}
            {vencidas.length > 0 && (
              <div
                className="rounded-xl p-4 border-2"
                style={{
                  backgroundColor: isDark ? '#3A1414' : '#FFF5F5',
                  borderColor: '#E53E3E',
                }}
              >
                <div
                  className="font-bold mb-2"
                  style={{ color: isDark ? '#FF8A8A' : '#C53030' }}
                >
                  🚨 OTs que superaron el tiempo estimado
                </div>
                <div className="space-y-1">
                  {vencidas.map((ot) => (
                    <div
                      key={ot.id}
                      className={`text-sm flex flex-wrap gap-x-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                    >
                      <span className="font-semibold">#{ot.id}</span>
                      <span>{ot.descripcionTarea}</span>
                      <span className="opacity-70">
                        ({(horasPorOT[ot.id] ?? 0).toFixed(1)}h trabajadas de{' '}
                        {ot.tiempoEstimado}h estimadas)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Mis OTs pendientes / que superviso ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={cardBase}>
                <h3
                  className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}
                >
                  Mis OTs Pendientes ({misPendientes.length})
                </h3>
                {misPendientes.length === 0 ? (
                  <p
                    className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    No tienes OTs pendientes asignadas. 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {misPendientes.map((ot) => {
                      const c = ESTADO_COLORS[ot.estado] ?? {
                        bg: '#F5F5F5',
                        color: '#555',
                      };
                      return (
                        <div
                          key={ot.id}
                          className={`flex items-center justify-between gap-2 text-sm p-2 rounded-lg ${
                            isDark ? 'bg-[#262626]' : 'bg-gray-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div
                              className={`font-medium truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                            >
                              #{ot.id} · {ot.descripcionTarea}
                            </div>
                            <div
                              className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              {getMaquinaNombre(ot)} · {fmtDate(ot.fechaHora)}
                              {esVencida(ot) && (
                                <span
                                  className="ml-2 font-semibold"
                                  style={{ color: '#C62828' }}
                                >
                                  ⏱ Vencida
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                            style={{ background: c.bg, color: c.color }}
                          >
                            {ot.estado}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={cardBase}>
                <h3
                  className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}
                >
                  OTs que Superviso ({superviso.length})
                </h3>
                {superviso.length === 0 ? (
                  <p
                    className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    No supervisas ninguna OT abierta actualmente.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {superviso.map((ot) => {
                      const c = ESTADO_COLORS[ot.estado] ?? {
                        bg: '#F5F5F5',
                        color: '#555',
                      };
                      return (
                        <div
                          key={ot.id}
                          className={`flex items-center justify-between gap-2 text-sm p-2 rounded-lg ${
                            isDark ? 'bg-[#262626]' : 'bg-gray-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div
                              className={`font-medium truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                            >
                              #{ot.id} · {ot.descripcionTarea}
                            </div>
                            <div
                              className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              {getMaquinaNombre(ot)} · {fmtDate(ot.fechaHora)}
                              {esVencida(ot) && (
                                <span
                                  className="ml-2 font-semibold"
                                  style={{ color: '#C62828' }}
                                >
                                  ⏱ Vencida
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                            style={{ background: c.bg, color: c.color }}
                          >
                            {ot.estado}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Próximo mantenimiento programado ─────────────────────────── */}
            {proximaProgramacion && (
              <Link
                to="/programacion-ot"
                className={`block ${cardBase} hover:shadow-md transition`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗓️</span>
                  <div className="min-w-0">
                    <div
                      className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      Próximo mantenimiento preventivo programado
                    </div>
                    <div
                      className={`font-medium truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                    >
                      {proximaProgramacion.nombre ||
                        proximaProgramacion.descripcionTarea}{' '}
                      — {fmtDate(proximaProgramacion.proximaEjecucion)}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* ── Alerta de Stock Crítico ───────────────────────────────────── */}
            {criticalRepuestos.length > 0 && (
              <div
                style={{
                  backgroundColor: isDark ? '#4A0000' : '#FFF5F5',
                  border: '3px solid #E53E3E',
                  borderRadius: 10,
                  padding: '20px 24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    marginBottom: 18,
                  }}
                >
                  <span style={{ fontSize: 36, lineHeight: 1 }}>⚠️</span>
                  <div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: isDark ? '#FF6B6B' : '#C53030',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      Alerta de Stock Crítico
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: isDark ? '#FFA0A0' : '#E53E3E',
                        marginTop: 2,
                      }}
                    >
                      {criticalRepuestos.length} repuesto
                      {criticalRepuestos.length > 1 ? 's' : ''} con stock por
                      debajo o igual al umbral crítico
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 12,
                  }}
                >
                  {criticalRepuestos.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(229,62,62,0.12)'
                          : 'rgba(229,62,62,0.07)',
                        border: '1px solid #FC8181',
                        borderRadius: 8,
                        padding: '12px 16px',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: isDark ? '#FFF' : '#1A1A1A',
                          marginBottom: 8,
                        }}
                      >
                        {r.nombre}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 16,
                          fontSize: 13,
                          color: isDark ? '#CCC' : '#555',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: isDark ? '#999' : '#888',
                              marginBottom: 2,
                            }}
                          >
                            STOCK ACTUAL
                          </div>
                          <div
                            style={{
                              fontSize: 22,
                              fontWeight: 800,
                              color: '#E53E3E',
                              lineHeight: 1,
                            }}
                          >
                            {r.cantidad}
                          </div>
                        </div>
                        <div
                          style={{
                            width: 1,
                            backgroundColor: isDark ? '#5C2020' : '#FCA5A5',
                            alignSelf: 'stretch',
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: isDark ? '#999' : '#888',
                              marginBottom: 2,
                            }}
                          >
                            STOCK CRÍTICO
                          </div>
                          <div
                            style={{
                              fontSize: 22,
                              fontWeight: 800,
                              color: isDark ? '#F6AD55' : '#C05621',
                              lineHeight: 1,
                            }}
                          >
                            {r.stockCritico}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
