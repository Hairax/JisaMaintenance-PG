import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlay,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaClock,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { SearchableSelect } from '../../../shared/components/SearchableSelect';
import { programacionOtService } from '../services/programacionOt.service';
import {
  EMPTY_FORM,
  ProgramacionOt,
  ProgramacionOtFormData,
} from '../types/programacionOt.types';
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

interface NamedOption {
  id: number;
  name: string;
}

interface ProcesoOption extends NamedOption {
  centroCosto: number;
}
interface MaquinaOption extends NamedOption {
  proceso_id: number;
  centroCosto_id: number;
}
interface SubUnidadOption extends NamedOption {
  maquina_id: number;
}

const FRECUENCIA_LABEL: Record<string, string> = {
  dias: 'día(s)',
  semanas: 'semana(s)',
  meses: 'mes(es)',
};

const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  const date = new Date(d.includes('T') ? d : `${d}T00:00:00`);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const diasHasta = (fecha: string): number => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const target = new Date(`${fecha}T00:00:00`);
  return Math.round((target.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

export default function ProgramacionOtPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const cardBg = theme === 'dark' ? '#232323' : '#FFFFFF';
  const errorColor = '#E53E3E';

  const [programaciones, setProgramaciones] = useState<ProgramacionOt[]>([]);
  const [tiposMantenimiento, setTiposMantenimiento] = useState<NamedOption[]>(
    [],
  );
  const [centrosCosto, setCentrosCosto] = useState<NamedOption[]>([]);
  const [procesos, setProcesos] = useState<ProcesoOption[]>([]);
  const [maquinas, setMaquinas] = useState<MaquinaOption[]>([]);
  const [subUnidades, setSubUnidades] = useState<SubUnidadOption[]>([]);
  const [departamentos, setDepartamentos] = useState<NamedOption[]>([]);
  const [objetos, setObjetos] = useState<NamedOption[]>([]);
  const [usuarios, setUsuarios] = useState<NamedOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProgramacionOtFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [ejecutandoId, setEjecutandoId] = useState<number | null>(null);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [progs, tipos, centros, procs, maqs, subs, deptos, objs, users] =
        await Promise.all([
          programacionOtService.getAll(),
          fetch(`${API}/tipo-mantenimientos`).then((r) =>
            r.ok ? r.json() : [],
          ),
          fetch(`${API}/cost-centers`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/process`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/maquinas`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/subunidades`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/departamentos`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/objetos`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/users`).then((r) => (r.ok ? r.json() : [])),
        ]);

      setProgramaciones(Array.isArray(progs) ? progs : []);
      setTiposMantenimiento(
        (Array.isArray(tipos) ? tipos : []).map((t) => ({
          id: t.id,
          name: t.nombre,
        })),
      );
      setCentrosCosto(
        (Array.isArray(centros) ? centros : []).map((c) => ({
          id: c.id,
          name: c.name,
        })),
      );
      setProcesos(
        (Array.isArray(procs) ? procs : []).map((p) => ({
          id: p.id,
          name: p.name,
          centroCosto: p.centroCosto,
        })),
      );
      setMaquinas(
        (Array.isArray(maqs) ? maqs : []).map((m) => ({
          id: m.id,
          name: m.name,
          proceso_id: m.proceso_id,
          centroCosto_id: m.centroCosto_id,
        })),
      );
      setSubUnidades(
        (Array.isArray(subs) ? subs : []).map((s) => ({
          id: s.id,
          name: s.descripcion,
          maquina_id: s.maquina_id,
        })),
      );
      setDepartamentos(
        (Array.isArray(deptos) ? deptos : []).map((d) => ({
          id: d.id,
          name: d.nombre,
        })),
      );
      setObjetos(
        (Array.isArray(objs) ? objs : []).map((o) => ({
          id: o.id,
          name: o.nombre,
        })),
      );
      setUsuarios(
        (Array.isArray(users) ? users : []).map((u) => ({
          id: u.id,
          name: `${u.name} ${u.lastName}`.trim(),
        })),
      );
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
    cargarTodo();
  }, [cargarTodo]);

  const maquinaMap = useMemo(
    () => Object.fromEntries(maquinas.map((m) => [m.id, m.name])),
    [maquinas],
  );
  const subUnidadMap = useMemo(
    () => Object.fromEntries(subUnidades.map((s) => [s.id, s.name])),
    [subUnidades],
  );
  const tipoMap = useMemo(
    () => Object.fromEntries(tiposMantenimiento.map((t) => [t.id, t.name])),
    [tiposMantenimiento],
  );

  // ── Cascada Centro de Costo → Proceso → Máquina → SubUnidad ──
  const centroCostoId = formData.centroCosto_id
    ? Number(formData.centroCosto_id)
    : undefined;
  const procesoId = formData.proceso_id
    ? Number(formData.proceso_id)
    : undefined;
  const maquinaId = formData.maquina_id
    ? Number(formData.maquina_id)
    : undefined;

  const procesosFiltrados = procesos.filter(
    (p) => centroCostoId === undefined || p.centroCosto === centroCostoId,
  );
  const maquinasFiltradas = maquinas.filter(
    (m) => procesoId === undefined || m.proceso_id === procesoId,
  );
  const subUnidadesFiltradas = subUnidades.filter(
    (s) => maquinaId === undefined || s.maquina_id === maquinaId,
  );

  const setField = <K extends keyof ProgramacionOtFormData>(
    field: K,
    value: ProgramacionOtFormData[K],
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'centroCosto_id') {
        next.proceso_id = '';
        next.maquina_id = '';
        next.subUnidad_id = '';
      } else if (field === 'proceso_id') {
        next.maquina_id = '';
        next.subUnidad_id = '';
      } else if (field === 'maquina_id') {
        next.subUnidad_id = '';
      }
      return next;
    });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setActionError('');
    setShowModal(true);
  };

  const openEditModal = (p: ProgramacionOt) => {
    setEditingId(p.id);
    setFormData({
      nombre: p.nombre ?? '',
      maquina_id: String(p.maquina_id),
      subUnidad_id: p.subUnidad_id ? String(p.subUnidad_id) : '',
      centroCosto_id: String(p.centroCosto_id),
      proceso_id: String(p.proceso_id),
      tipoOT_id: String(p.tipoOT_id),
      departamento_id: String(p.departamento_id),
      objeto_id: String(p.objeto_id),
      supervisor_id: String(p.supervisor_id),
      tipoEjecucion: p.tipoEjecucion,
      descripcionTarea: p.descripcionTarea,
      indicacionesEspeciales: p.indicacionesEspeciales ?? '',
      tiempoEstimado: p.tiempoEstimado != null ? String(p.tiempoEstimado) : '',
      frecuenciaValor: String(p.frecuenciaValor),
      frecuenciaUnidad: p.frecuenciaUnidad,
      fechaInicio: p.fechaInicio,
      activo: p.activo,
    });
    setActionError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const validar = (): string | null => {
    if (!formData.centroCosto_id) return 'Selecciona un centro de costo';
    if (!formData.proceso_id) return 'Selecciona un proceso';
    if (!formData.maquina_id) return 'Selecciona una máquina';
    if (!formData.tipoOT_id) return 'Selecciona el tipo de mantenimiento';
    if (!formData.departamento_id) return 'Selecciona un departamento';
    if (!formData.objeto_id) return 'Selecciona un objeto';
    if (!formData.supervisor_id) return 'Selecciona un supervisor';
    if (!formData.descripcionTarea.trim())
      return 'Describe la tarea a realizar';
    if (!formData.frecuenciaValor || Number(formData.frecuenciaValor) < 1)
      return 'La frecuencia debe ser un número mayor a 0';
    if (!formData.fechaInicio) return 'Selecciona una fecha de inicio';
    return null;
  };

  const handleGuardar = async () => {
    const err = validar();
    if (err) {
      setActionError(err);
      return;
    }
    setSaving(true);
    setActionError('');
    try {
      const payload = {
        nombre: formData.nombre || undefined,
        maquina_id: Number(formData.maquina_id),
        subUnidad_id: formData.subUnidad_id
          ? Number(formData.subUnidad_id)
          : undefined,
        centroCosto_id: Number(formData.centroCosto_id),
        proceso_id: Number(formData.proceso_id),
        tipoOT_id: Number(formData.tipoOT_id),
        departamento_id: Number(formData.departamento_id),
        objeto_id: Number(formData.objeto_id),
        supervisor_id: Number(formData.supervisor_id),
        tipoEjecucion: formData.tipoEjecucion || 'Preventivo',
        descripcionTarea: formData.descripcionTarea,
        indicacionesEspeciales: formData.indicacionesEspeciales || undefined,
        tiempoEstimado: formData.tiempoEstimado
          ? Number(formData.tiempoEstimado)
          : undefined,
        frecuenciaValor: Number(formData.frecuenciaValor),
        frecuenciaUnidad: formData.frecuenciaUnidad,
        fechaInicio: formData.fechaInicio,
        activo: formData.activo,
      };

      if (editingId) {
        await programacionOtService.update(editingId, payload);
      } else {
        await programacionOtService.create(payload);
      }
      await cargarTodo();
      closeModal();
    } catch (err: unknown) {
      setActionError(
        (err as Error).message || 'Error al guardar la programación',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActivo = async (p: ProgramacionOt) => {
    try {
      await programacionOtService.update(p.id, { activo: !p.activo });
      await cargarTodo();
    } catch (err) {
      console.error(err);
      setError('No se pudo cambiar el estado de la programación');
    }
  };

  const handleEliminar = async (id: number) => {
    if (
      !window.confirm(
        '¿Eliminar esta programación de mantenimiento? Esta acción no se puede deshacer.',
      )
    ) {
      return;
    }
    try {
      await programacionOtService.remove(id);
      setProgramaciones((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar la programación');
    }
  };

  const handleEjecutarAhora = async (id: number) => {
    if (
      !window.confirm(
        'Se creará una nueva OT de inmediato para esta programación. ¿Continuar?',
      )
    ) {
      return;
    }
    setEjecutandoId(id);
    try {
      await programacionOtService.ejecutarAhora(id);
      await cargarTodo();
    } catch (err) {
      console.error(err);
      setError('No se pudo ejecutar la programación');
    } finally {
      setEjecutandoId(null);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    fontSize: '13px',
    color: secondaryTextColor,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    backgroundColor: inputBgColor,
    color: textColor,
    border: `1px solid ${inputBorderColor}`,
    borderRadius: '4px',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h1 style={{ color: secondaryTextColor, margin: 0 }}>
              Programación Automática de OTs
            </h1>
            <p style={{ fontSize: '13px', opacity: 0.7, margin: '4px 0 0' }}>
              Define cada cuánto tiempo se debe crear automáticamente una orden
              de trabajo para un activo (ideal para mantenimiento preventivo).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/programacion-ot/calendario')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'transparent',
                color: secondaryTextColor,
                border: `1px solid ${secondaryTextColor}`,
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              <FaCalendarAlt /> Ver Calendario
            </button>
            <button
              onClick={openCreateModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: colors.gold,
                color: colors.darkText,
                border: 'none',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              <FaPlus /> Nueva Programación
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: errorColor,
              color: '#FFF',
              padding: '10px',
              borderRadius: '4px',
              margin: '15px 0',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Cargando programaciones...
          </div>
        ) : programaciones.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '50px 20px',
              marginTop: '15px',
              backgroundColor: cardBg,
              borderRadius: '8px',
              border: `1px solid ${inputBorderColor}`,
            }}
          >
            <FaClock size={32} style={{ opacity: 0.4, marginBottom: '10px' }} />
            <p>No hay programaciones registradas todavía.</p>
            <p style={{ fontSize: '13px', opacity: 0.7 }}>
              Crea una para automatizar la generación de OTs preventivas.
            </p>
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
              backgroundColor: cardBg,
              borderRadius: '8px',
              border: `1px solid ${inputBorderColor}`,
              marginTop: '15px',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.88rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      theme === 'dark' ? colors.brown : colors.gold,
                  }}
                >
                  {[
                    'Programación',
                    'Activo / SubUnidad',
                    'Tipo',
                    'Frecuencia',
                    'Próxima Ejecución',
                    'Última Ejecución',
                    'Estado',
                    'Acciones',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px',
                        borderBottom: `1px solid ${inputBorderColor}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programaciones.map((p, idx) => {
                  const dias = diasHasta(p.proximaEjecucion);
                  const vencida = dias <= 0;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        backgroundColor:
                          idx % 2 === 0
                            ? 'transparent'
                            : theme === 'dark'
                              ? '#1D1D1D'
                              : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: 600 }}>
                        {p.nombre || `Programación #${p.id}`}
                        <div
                          style={{
                            fontSize: '11px',
                            opacity: 0.6,
                            fontWeight: 400,
                            maxWidth: 220,
                          }}
                        >
                          {p.descripcionTarea}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {maquinaMap[p.maquina_id] ?? `Máquina #${p.maquina_id}`}
                        {p.subUnidad_id && (
                          <div style={{ fontSize: '11px', opacity: 0.7 }}>
                            {subUnidadMap[p.subUnidad_id] ??
                              `SubUnidad #${p.subUnidad_id}`}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {tipoMap[p.tipoOT_id] ?? '—'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        Cada {p.frecuenciaValor}{' '}
                        {FRECUENCIA_LABEL[p.frecuenciaUnidad]}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: !p.activo
                              ? textColor
                              : vencida
                                ? '#E65100'
                                : '#2E7D32',
                          }}
                        >
                          {fmtDate(p.proximaEjecucion)}
                        </span>
                        {p.activo && (
                          <div style={{ fontSize: '11px', opacity: 0.7 }}>
                            {vencida
                              ? 'Vencida — se generará pronto'
                              : `en ${dias} día(s)`}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {fmtDate(p.ultimaEjecucion)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleToggleActivo(p)}
                          title={p.activo ? 'Desactivar' : 'Activar'}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: p.activo ? '#2E7D32' : '#999',
                            fontWeight: 600,
                            fontSize: '12px',
                          }}
                        >
                          {p.activo ? (
                            <FaToggleOn size={18} />
                          ) : (
                            <FaToggleOff size={18} />
                          )}
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            onClick={() => handleEjecutarAhora(p.id)}
                            disabled={ejecutandoId === p.id}
                            title="Generar la OT ahora mismo"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: '#2196F3',
                              color: '#FFF',
                              border: 'none',
                              padding: '6px 9px',
                              borderRadius: '4px',
                              cursor:
                                ejecutandoId === p.id
                                  ? 'not-allowed'
                                  : 'pointer',
                              fontSize: '11px',
                              opacity: ejecutandoId === p.id ? 0.6 : 1,
                            }}
                          >
                            <FaPlay />{' '}
                            {ejecutandoId === p.id ? '...' : 'Ejecutar'}
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: colors.brown,
                              color: '#FFF',
                              border: 'none',
                              padding: '6px 9px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                            }}
                          >
                            <FaEdit /> Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(p.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: errorColor,
                              color: '#FFF',
                              border: 'none',
                              padding: '6px 9px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                            }}
                          >
                            <FaTrash /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            zIndex: 1000,
            overflowY: 'auto',
            padding: '40px 20px',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: inputBgColor,
              color: textColor,
              padding: '24px',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '760px',
              border: `1px solid ${inputBorderColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: secondaryTextColor }}>
              {editingId ? 'Editar Programación' : 'Nueva Programación de OT'}
            </h2>

            {actionError && (
              <div
                style={{
                  backgroundColor: errorColor,
                  color: '#FFF',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '16px',
                }}
              >
                {actionError}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Nombre / Etiqueta (opcional)</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                placeholder="Ej: Mantenimiento preventivo Ventilador D"
                disabled={saving}
                style={inputStyle}
              />
            </div>

            <div
              className="grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                marginBottom: '14px',
              }}
            >
              <div>
                <label style={labelStyle}>Centro de Costo *</label>
                <SearchableSelect
                  options={centrosCosto}
                  value={formData.centroCosto_id}
                  onChange={(id) => setField('centroCosto_id', String(id))}
                  disabled={saving}
                  inputBg={bgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  label="Centro de Costo"
                />
              </div>
              <div>
                <label style={labelStyle}>Proceso *</label>
                <SearchableSelect
                  options={procesosFiltrados}
                  value={formData.proceso_id}
                  onChange={(id) => setField('proceso_id', String(id))}
                  disabled={saving || !formData.centroCosto_id}
                  inputBg={bgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  label="Proceso"
                  placeholder={
                    !formData.centroCosto_id
                      ? 'Selecciona un centro de costo primero'
                      : 'Selecciona un proceso'
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Máquina *</label>
                <SearchableSelect
                  options={maquinasFiltradas}
                  value={formData.maquina_id}
                  onChange={(id) => setField('maquina_id', String(id))}
                  disabled={saving || !formData.proceso_id}
                  inputBg={bgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  label="Máquina"
                  placeholder={
                    !formData.proceso_id
                      ? 'Selecciona un proceso primero'
                      : 'Selecciona una máquina'
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Sub Unidad (opcional)</label>
                <SearchableSelect
                  options={subUnidadesFiltradas}
                  value={formData.subUnidad_id}
                  onChange={(id) => setField('subUnidad_id', String(id))}
                  disabled={saving || !formData.maquina_id}
                  inputBg={bgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  label="Sub Unidad"
                  placeholder={
                    !formData.maquina_id
                      ? 'Selecciona una máquina primero'
                      : 'Selecciona una sub unidad'
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Mantenimiento *</label>
                <SearchableSelect
                  options={tiposMantenimiento}
                  value={formData.tipoOT_id}
                  onChange={(id) => setField('tipoOT_id', String(id))}
                  disabled={saving}
                  inputBg={bgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  label="Tipo de Mantenimiento"
                />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Ejecución</label>
                <select
                  value={formData.tipoEjecucion}
                  onChange={(e) => setField('tipoEjecucion', e.target.value)}
                  disabled={saving}
                  style={inputStyle}
                >
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Predictivo">Predictivo</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Departamento *</label>
                <SearchableSelect
                  options={departamentos}
                  value={formData.departamento_id}
                  onChange={(id) => setField('departamento_id', String(id))}
                  disabled={saving}
                  inputBg={bgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  label="Departamento"
                />
              </div>
              <div>
                <label style={labelStyle}>Objeto *</label>
                <SearchableSelect
                  options={objetos}
                  value={formData.objeto_id}
                  onChange={(id) => setField('objeto_id', String(id))}
                  disabled={saving}
                  inputBg={bgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  label="Objeto"
                />
              </div>
              <div>
                <label style={labelStyle}>Supervisor *</label>
                <SearchableSelect
                  options={usuarios}
                  value={formData.supervisor_id}
                  onChange={(id) => setField('supervisor_id', String(id))}
                  disabled={saving}
                  inputBg={bgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  label="Supervisor"
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Tiempo Estimado (hrs, opcional)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.tiempoEstimado}
                  onChange={(e) => setField('tiempoEstimado', e.target.value)}
                  disabled={saving}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Descripción de la Tarea *</label>
              <textarea
                value={formData.descripcionTarea}
                onChange={(e) => setField('descripcionTarea', e.target.value)}
                disabled={saving}
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>
                Indicaciones Especiales (opcional)
              </label>
              <textarea
                value={formData.indicacionesEspeciales}
                onChange={(e) =>
                  setField('indicacionesEspeciales', e.target.value)
                }
                disabled={saving}
                rows={2}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: bgColor,
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '6px',
                padding: '14px',
                marginBottom: '14px',
              }}
            >
              <p
                style={{
                  margin: '0 0 10px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  color: secondaryTextColor,
                }}
              >
                ⏱ Recurrencia
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '14px',
                }}
              >
                <div>
                  <label style={labelStyle}>Repetir cada *</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.frecuenciaValor}
                    onChange={(e) =>
                      setField('frecuenciaValor', e.target.value)
                    }
                    disabled={saving}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Unidad *</label>
                  <select
                    value={formData.frecuenciaUnidad}
                    onChange={(e) =>
                      setField(
                        'frecuenciaUnidad',
                        e.target
                          .value as ProgramacionOtFormData['frecuenciaUnidad'],
                      )
                    }
                    disabled={saving}
                    style={inputStyle}
                  >
                    <option value="dias">Días</option>
                    <option value="semanas">Semanas</option>
                    <option value="meses">Meses</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Fecha de Inicio *</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setField('fechaInicio', e.target.value)}
                    disabled={saving}
                    style={inputStyle}
                  />
                </div>
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setField('activo', e.target.checked)}
                  disabled={saving}
                />
                Programación activa (generará OTs automáticamente)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={closeModal}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: inputBorderColor,
                  color: textColor,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: '10px',
                  backgroundColor: colors.gold,
                  color: colors.darkText,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {saving
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar Cambios'
                    : 'Crear Programación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
