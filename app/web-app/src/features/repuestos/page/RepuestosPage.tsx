import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';

const API = 'http://localhost:3000';

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkCard: '#232323',
  lightCard: '#FFFFFF',
  darkText: '#000000',
  lightText: '#FFFFFF',
  border: '#B0B0B0',
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface CostCenter {
  id: number;
  name: string;
}
interface Process {
  id: number;
  name: string;
  centroCosto: number;
}
interface Maquina {
  id: number;
  name: string;
  centroCosto_id: number;
  proceso_id: number;
}
interface SubUnidad {
  id: number;
  maquina_id: number;
  descripcion: string;
}
interface Repuesto {
  id: number;
  nombre: string;
  descripcion: string;
  uMedida: string;
  numeroDeParte: string;
  ubicacion: string;
  especificacion: string;
  costoUnitario: number;
  cantidad: number;
  stockCritico: number;
  correlativo: number;
  centroCosto_id: number;
  proceso_id: number;
  maquina_id: number;
  subUnidad_id: number;
}

interface MovimientoDetalle {
  repuestoId?: number;
  productoId?: number;
  codigo?: string;
  nombre?: string;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
}

interface CompraDoc {
  id: number;
  nroDocumento?: string;
  fecha: string;
  detalles?: MovimientoDetalle[];
}

interface SalidaDoc {
  id: number;
  nroSalida?: string;
  fecha: string;
  detalles?: MovimientoDetalle[];
}

interface MovimientoRepuesto {
  tipo: 'COMPRA' | 'SALIDA';
  fecha: string;
  referencia: string;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  uMedida: 'PZA',
  numeroDeParte: '',
  ubicacion: '',
  especificacion: '',
  costoUnitario: '',
  stockActual: '',
  stockCritico: '',
};

function padId(n: number, digits: number) {
  return String(n).padStart(digits, '0');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RepuestosPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg = isDark ? colors.darkBg : colors.lightBg;
  const card = isDark ? colors.darkCard : colors.lightCard;
  const text = isDark ? colors.lightText : colors.darkText;
  const secondary = isDark ? colors.beige : colors.brown;
  const inputBg = isDark ? '#2A2A2A' : '#F5F5F5';
  const inputBorder = isDark ? '#3A3A3A' : '#CCCCCC';
  const theadBg = isDark ? colors.brown : colors.gold;

  // ── Catalog data ────────────────────────────────────────────────────────────
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [subUnidades, setSubUnidades] = useState<SubUnidad[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [comprasHist, setComprasHist] = useState<CompraDoc[]>([]);
  const [salidasHist, setSalidasHist] = useState<SalidaDoc[]>([]);

  // ── Cascading selections ─────────────────────────────────────────────────────
  const [ccId, setCcId] = useState('');
  const [procId, setProcId] = useState('');
  const [maqId, setMaqId] = useState('');
  const [subId, setSubId] = useState('');
  const [correlativo, setCorrelativo] = useState(1);

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [viewRepuesto, setViewRepuesto] = useState<Repuesto | null>(null);

  // ── Load catalogs on mount ──────────────────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cc, proc, maq, sub, rep, compras, salidas] = await Promise.all([
        fetch(`${API}/cost-centers`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API}/process`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API}/maquinas`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API}/subunidades`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API}/repuestos`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API}/compras`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API}/salidas`).then((r) => (r.ok ? r.json() : [])),
      ]);
      console.log(rep);
      setCostCenters(Array.isArray(cc) ? cc : []);
      setProcesses(Array.isArray(proc) ? proc : []);
      setMaquinas(Array.isArray(maq) ? maq : []);
      setSubUnidades(Array.isArray(sub) ? sub : []);
      setRepuestos(Array.isArray(rep) ? rep : []);
      setComprasHist(Array.isArray(compras) ? compras : []);
      setSalidasHist(Array.isArray(salidas) ? salidas : []);
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // ── Cascade resets ──────────────────────────────────────────────────────────
  const handleCcChange = (val: string) => {
    setCcId(val);
    setProcId('');
    setMaqId('');
    setSubId('');
  };
  const handleProcChange = (val: string) => {
    setProcId(val);
    setMaqId('');
    setSubId('');
  };
  const handleMaqChange = (val: string) => {
    setMaqId(val);
    setSubId('');
  };

  // ── Filtered lists ──────────────────────────────────────────────────────────
  const filteredProcesses = ccId
    ? processes.filter((p) => String(p.centroCosto) === ccId)
    : processes;
  const filteredMaquinas = procId
    ? maquinas.filter((m) => String(m.proceso_id) === procId)
    : [];
  const filteredSubUnidades = maqId
    ? subUnidades.filter((s) => String(s.maquina_id) === maqId)
    : [];

  // ── Composite ID helpers ────────────────────────────────────────────────────
  const buildCompositeId = (
    cc: string,
    proc: string,
    maq: string,
    sub: string,
    corr: number,
  ) =>
    [cc, proc, maq, sub]
      .filter(Boolean)
      .concat(sub ? [padId(corr, 3)] : [])
      .join('.');

  const compositeId = buildCompositeId(ccId, procId, maqId, subId, correlativo);

  const getRepuestoCompositeId = (r: Repuesto) =>
    buildCompositeId(
      r.centroCosto_id ? String(r.centroCosto_id) : '',
      r.proceso_id ? String(r.proceso_id) : '',
      r.maquina_id ? String(r.maquina_id) : '',
      r.subUnidad_id ? String(r.subUnidad_id) : '',
      r.correlativo ?? 0,
    );

  // ── Auto-correlativo: when subId changes, compute next correlativo ──────────
  useEffect(() => {
    if (!subId || modalMode !== 'add') return;
    const existing = repuestos
      .filter((r) => String(r.subUnidad_id) === subId && r.correlativo != null)
      .map((r) => r.correlativo);
    const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
    setCorrelativo(next);
  }, [subId, repuestos, modalMode]);

  // ── Form handlers ────────────────────────────────────────────────────────────
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetModal = () => {
    setForm({ ...EMPTY_FORM });
    setCcId('');
    setProcId('');
    setMaqId('');
    setSubId('');
    setCorrelativo(1);
    setError('');
    setEditId(null);
  };

  const openAddModal = () => {
    resetModal();
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (rep: Repuesto) => {
    resetModal();
    setForm({
      nombre: rep.nombre,
      descripcion: rep.descripcion ?? '',
      uMedida: rep.uMedida || 'PZA',
      numeroDeParte: rep.numeroDeParte ?? '',
      ubicacion: rep.ubicacion ?? '',
      especificacion: rep.especificacion ?? '',
      costoUnitario: String(rep.costoUnitario),
      stockActual: String(rep.cantidad),
      stockCritico: rep.stockCritico != null ? String(rep.stockCritico) : '',
    });
    if (rep.centroCosto_id) setCcId(String(rep.centroCosto_id));
    if (rep.proceso_id) setProcId(String(rep.proceso_id));
    if (rep.maquina_id) setMaqId(String(rep.maquina_id));
    if (rep.subUnidad_id) setSubId(String(rep.subUnidad_id));
    if (rep.correlativo) setCorrelativo(rep.correlativo);
    setEditId(rep.id);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      setError('La descripción es requerida');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        uMedida: form.uMedida || undefined,
        numeroDeParte: form.numeroDeParte || undefined,
        ubicacion: form.ubicacion || undefined,
        especificacion: form.especificacion || undefined,
        costoUnitario: Number(form.costoUnitario) || 0,
        cantidad: Number(form.stockActual) || 0,
        stockCritico: form.stockCritico ? Number(form.stockCritico) : undefined,
        correlativo: correlativo || undefined,
        centroCosto_id: ccId ? Number(ccId) : undefined,
        proceso_id: procId ? Number(procId) : undefined,
        maquina_id: maqId ? Number(maqId) : undefined,
        subUnidad_id: subId ? Number(subId) : undefined,
      };
      const url =
        modalMode === 'add' ? `${API}/repuestos` : `${API}/repuestos/${editId}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al guardar');
      await loadAll();
      setShowModal(false);
      resetModal();
    } catch (e) {
      setError((e as Error).message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm('¿Eliminar este repuesto?')) return;
    try {
      await fetch(`${API}/repuestos/${id}`, { method: 'DELETE' });
      setRepuestos((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Error al eliminar');
    }
  }, []);

  // ── Filtered repuestos table ─────────────────────────────────────────────────
  const filteredRepuestos = repuestos.filter((r) => {
    // Hierarchy filter from left panel
    if (ccId && String(r.centroCosto_id) !== ccId) return false;
    if (procId && String(r.proceso_id) !== procId) return false;
    if (maqId && String(r.maquina_id) !== maqId) return false;
    if (subId && String(r.subUnidad_id) !== subId) return false;
    // Text search: composite ID or nombre
    if (searchQ) {
      const q = searchQ.toLowerCase();
      const cid = getRepuestoCompositeId(r).toLowerCase();
      return cid.includes(q) || r.nombre.toLowerCase().includes(q);
    }
    return true;
  });

  // ── Shared styles ────────────────────────────────────────────────────────────
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 600,
    marginBottom: 4,
    color: secondary,
    fontSize: 13,
    minWidth: 110,
    textAlign: 'right',
    paddingRight: 8,
    flexShrink: 0,
  };
  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '5px 8px',
    backgroundColor: inputBg,
    color: text,
    border: `1px solid ${inputBorder}`,
    borderRadius: 3,
    fontSize: 13,
    minWidth: 0,
  };
  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };
  const row: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  };
  const badgeStyle: React.CSSProperties = {
    minWidth: 32,
    padding: '5px 6px',
    backgroundColor: inputBg,
    color: text,
    border: `1px solid ${inputBorder}`,
    borderRadius: 3,
    fontSize: 13,
    textAlign: 'center',
  };
  const btnBase: React.CSSProperties = {
    padding: '5px 12px',
    border: 'none',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  };

  const getMovimientosRepuesto = useCallback(
    (repuestoId: number): MovimientoRepuesto[] => {
      const movimientosCompra: MovimientoRepuesto[] = comprasHist.flatMap((c) =>
        (c.detalles ?? [])
          .filter((d) => Number(d.repuestoId ?? d.productoId) === repuestoId)
          .map((d) => ({
            tipo: 'COMPRA' as const,
            fecha: c.fecha,
            referencia: c.nroDocumento || `Compra #${c.id}`,
            codigo: d.codigo || '',
            nombre: d.nombre || '',
            cantidad: Number(d.cantidad) || 0,
            precioUnitario: Number(d.precioUnitario) || 0,
            subtotal:
              Number(d.subtotal) ||
              (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0),
          })),
      );

      const movimientosSalida: MovimientoRepuesto[] = salidasHist.flatMap((s) =>
        (s.detalles ?? [])
          .filter((d) => Number(d.repuestoId ?? d.productoId) === repuestoId)
          .map((d) => ({
            tipo: 'SALIDA' as const,
            fecha: s.fecha,
            referencia: s.nroSalida || `Salida #${s.id}`,
            codigo: d.codigo || '',
            nombre: d.nombre || '',
            cantidad: Number(d.cantidad) || 0,
            precioUnitario: Number(d.precioUnitario) || 0,
            subtotal:
              Number(d.subtotal) ||
              (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0),
          })),
      );

      return [...movimientosCompra, ...movimientosSalida].sort((a, b) => {
        const ta = new Date(a.fecha).getTime();
        const tb = new Date(b.fecha).getTime();
        return tb - ta;
      });
    },
    [comprasHist, salidasHist],
  );

  const movimientosRepuesto = viewRepuesto
    ? getMovimientosRepuesto(viewRepuesto.id)
    : [];

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        backgroundColor: bg,
        color: text,
        minHeight: '100vh',
        padding: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: secondary,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          MAESTRO DE REPUESTOS
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={loadAll}
            disabled={loading}
            style={{
              ...btnBase,
              backgroundColor: colors.gold,
              color: colors.darkText,
            }}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button
            onClick={openAddModal}
            style={{ ...btnBase, backgroundColor: colors.brown, color: '#FFF' }}
          >
            + Nuevo Repuesto
          </button>
        </div>
      </div>

      {error && !showModal && (
        <div
          style={{
            backgroundColor: '#E53E3E',
            color: '#FFF',
            padding: '8px 12px',
            borderRadius: 4,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* ── Critical Stock Alert ─────────────────────────────────────────── */}
      {(() => {
        const critical = repuestos.filter(
          (r) => r.stockCritico != null && r.cantidad <= r.stockCritico,
        );
        if (critical.length === 0) return null;
        return (
          <div
            style={{
              backgroundColor: isDark ? '#5C0000' : '#FFF0F0',
              border: '2px solid #E53E3E',
              borderRadius: 8,
              padding: '14px 18px',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 26, lineHeight: 1 }}>⚠️</span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: isDark ? '#FF8888' : '#C53030',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                ALERTA DE STOCK CRÍTICO — {critical.length} repuesto
                {critical.length > 1 ? 's' : ''} por debajo del umbral
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {critical.map((r) => (
                <div
                  key={r.id}
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(229,62,62,0.15)'
                      : 'rgba(229,62,62,0.08)',
                    border: '1px solid #E53E3E',
                    borderRadius: 5,
                    padding: '6px 12px',
                    fontSize: 13,
                    color: isDark ? '#FFF' : '#333',
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{r.nombre}</span>
                  <span
                    style={{
                      margin: '0 6px',
                      color: isDark ? '#888' : '#999',
                    }}
                  >
                    |
                  </span>
                  Stock:{' '}
                  <span
                    style={{
                      fontWeight: 700,
                      color: '#E53E3E',
                      fontSize: 14,
                    }}
                  >
                    {r.cantidad}
                  </span>
                  <span
                    style={{ color: isDark ? '#888' : '#999', margin: '0 4px' }}
                  >
                    /
                  </span>
                  Crítico: {r.stockCritico}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* ── LEFT: preview / quick info ─────────────────────────────────── */}
        <div
          style={{
            backgroundColor: card,
            border: `1px solid ${inputBorder}`,
            borderRadius: 6,
            padding: 16,
          }}
        >
          <h3
            style={{
              margin: '0 0 12px',
              color: secondary,
              fontSize: 14,
              borderBottom: `2px solid ${colors.gold}`,
              paddingBottom: 6,
            }}
          >
            Filtrar por Jerarquía
          </h3>

          {/* CC */}
          <div style={row}>
            <span style={labelStyle}>C.Costo</span>
            <select
              value={ccId}
              onChange={(e) => handleCcChange(e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
            >
              <option value="">-- Seleccionar --</option>
              {costCenters.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} - {c.id}
                </option>
              ))}
            </select>
            <span style={badgeStyle}>{ccId || '—'}</span>
          </div>

          {/* Proceso */}
          <div style={row}>
            <span style={labelStyle}>Proceso</span>
            <select
              value={procId}
              onChange={(e) => handleProcChange(e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
              disabled={!ccId}
            >
              <option value="">-- Seleccionar --</option>
              {filteredProcesses.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name} - {p.id}
                </option>
              ))}
            </select>
            <span style={badgeStyle}>{procId || '—'}</span>
          </div>

          {/* Máquina */}
          <div style={row}>
            <span style={labelStyle}>Máquina</span>
            <select
              value={maqId}
              onChange={(e) => handleMaqChange(e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
              disabled={!procId}
            >
              <option value="">-- Seleccionar --</option>
              {filteredMaquinas.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.name} - {m.id}
                </option>
              ))}
            </select>
            <span style={badgeStyle}>{maqId || '—'}</span>
          </div>

          {/* SubUnidad */}
          <div style={row}>
            <span style={labelStyle}>SubUnidad</span>
            <select
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
              disabled={!maqId}
            >
              <option value="">-- Seleccionar --</option>
              {filteredSubUnidades.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.descripcion} - {s.id}
                </option>
              ))}
            </select>
            <span style={badgeStyle}>{subId || '—'}</span>
          </div>

          {/* Composite ID */}
          <div
            style={{
              marginTop: 16,
              padding: '10px 14px',
              backgroundColor: inputBg,
              borderRadius: 4,
              border: `1px solid ${inputBorder}`,
            }}
          >
            <span style={{ fontSize: 12, color: secondary, fontWeight: 600 }}>
              ID Correlativo:{' '}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: text,
                fontFamily: 'monospace',
              }}
            >
              {compositeId || '—'}
            </span>
          </div>

          <p
            style={{
              marginTop: 20,
              fontSize: 12,
              color: isDark ? '#888' : '#666',
              lineHeight: 1.6,
            }}
          >
            Selecciona la jerarquía completa para filtrar los repuestos de la
            tabla o para asignar un nuevo repuesto a una sub-unidad específica.
          </p>
        </div>

        {/* ── RIGHT: repuestos table ───────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: card,
            border: `1px solid ${inputBorder}`,
            borderRadius: 6,
            padding: 16,
          }}
        >
          <h3
            style={{
              margin: '0 0 10px',
              color: secondary,
              fontSize: 14,
              borderBottom: `2px solid ${colors.gold}`,
              paddingBottom: 6,
            }}
          >
            Relación de Repuestos
          </h3>
          <input
            placeholder="Buscar por ID o nombre..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            style={{
              ...inputStyle,
              marginBottom: 10,
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: theadBg,
                    color: isDark ? '#FFF' : colors.darkText,
                    position: 'sticky',
                    top: 0,
                  }}
                >
                  {['Item', 'Nombre', 'Stock', 'Costo U$', 'Acciones'].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {loading && filteredRepuestos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: 'center', padding: 20 }}
                    >
                      Cargando...
                    </td>
                  </tr>
                ) : filteredRepuestos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: 'center',
                        padding: 20,
                        color: isDark ? '#888' : '#666',
                      }}
                    >
                      No hay repuestos
                    </td>
                  </tr>
                ) : (
                  filteredRepuestos.map((r, i) => {
                    const isCritical =
                      r.stockCritico != null && r.cantidad <= r.stockCritico;
                    return (
                      <tr
                        key={r.id}
                        style={{
                          backgroundColor: isCritical
                            ? isDark
                              ? '#3D0000'
                              : '#FFF0F0'
                            : i % 2 === 0
                              ? 'transparent'
                              : isDark
                                ? '#2A2A2A'
                                : '#F7F7F7',
                        }}
                      >
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                            fontFamily: 'monospace',
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getRepuestoCompositeId(r) || r.id}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                          }}
                        >
                          {r.nombre}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                            color: isCritical ? '#E53E3E' : undefined,
                            fontWeight: isCritical ? 700 : undefined,
                          }}
                        >
                          {r.cantidad}
                          {isCritical && (
                            <span
                              style={{ marginLeft: 4, fontSize: 12 }}
                              title={`Stock crítico: ${r.stockCritico}`}
                            >
                              ⚠️
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                          }}
                        >
                          $ {Number(r.costoUnitario).toFixed(4)}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <button
                            onClick={() => setViewRepuesto(r)}
                            style={{
                              ...btnBase,
                              backgroundColor: colors.gold,
                              color: colors.darkText,
                              padding: '3px 8px',
                              marginRight: 4,
                              fontSize: 12,
                            }}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => openEditModal(r)}
                            style={{
                              ...btnBase,
                              backgroundColor: '#2196F3',
                              color: '#FFF',
                              padding: '3px 8px',
                              marginRight: 4,
                              fontSize: 12,
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            style={{
                              ...btnBase,
                              backgroundColor: '#E53E3E',
                              color: '#FFF',
                              padding: '3px 8px',
                              fontSize: 12,
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ Modal ═══════════════════════════════════════════════════════════*/}
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: card,
              color: text,
              padding: 24,
              borderRadius: 8,
              width: '100%',
              maxWidth: 720,
              border: `1px solid ${inputBorder}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal title */}
            <div
              style={{
                borderBottom: `2px solid ${colors.gold}`,
                paddingBottom: 10,
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, color: secondary, fontSize: 16 }}>
                {modalMode === 'add' ? 'Nuevo Repuesto' : 'Editar Repuesto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  ...btnBase,
                  backgroundColor: 'transparent',
                  color: text,
                  fontSize: 18,
                  padding: '0 6px',
                }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: '#E53E3E',
                  color: '#FFF',
                  padding: '8px 12px',
                  borderRadius: 4,
                  marginBottom: 14,
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0 24px',
              }}
            >
              {/* ─── LEFT COLUMN: cascading selects ─────────────────────── */}
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: secondary,
                    margin: '0 0 8px',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Jerarquía
                </p>

                {/* C.Costo */}
                <div style={row}>
                  <span style={labelStyle}>C.Costo</span>
                  <select
                    value={ccId}
                    onChange={(e) => handleCcChange(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">-- Seleccionar --</option>
                    {costCenters.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span style={badgeStyle}>{ccId || '—'}</span>
                </div>

                {/* Proceso */}
                <div style={row}>
                  <span style={labelStyle}>Proceso</span>
                  <select
                    value={procId}
                    onChange={(e) => handleProcChange(e.target.value)}
                    style={selectStyle}
                    disabled={!ccId}
                  >
                    <option value="">-- Seleccionar --</option>
                    {filteredProcesses.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <span style={badgeStyle}>{procId || '—'}</span>
                </div>

                {/* Máquina */}
                <div style={row}>
                  <span style={labelStyle}>Máquina</span>
                  <select
                    value={maqId}
                    onChange={(e) => handleMaqChange(e.target.value)}
                    style={selectStyle}
                    disabled={!procId}
                  >
                    <option value="">-- Seleccionar --</option>
                    {filteredMaquinas.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <span style={badgeStyle}>{maqId || '—'}</span>
                </div>

                {/* SubUnidad */}
                <div style={row}>
                  <span style={labelStyle}>SubUnidad</span>
                  <select
                    value={subId}
                    onChange={(e) => setSubId(e.target.value)}
                    style={selectStyle}
                    disabled={!maqId}
                  >
                    <option value="">-- Seleccionar --</option>
                    {filteredSubUnidades.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.descripcion}
                      </option>
                    ))}
                  </select>
                  <span style={badgeStyle}>{subId || '—'}</span>
                </div>

                {/* Correlativo */}
                <div style={row}>
                  <span style={labelStyle}>Correlativo</span>
                  <input
                    type="number"
                    min={1}
                    value={correlativo}
                    onChange={(e) =>
                      setCorrelativo(Math.max(1, Number(e.target.value)))
                    }
                    style={{ ...inputStyle, maxWidth: 70 }}
                  />
                </div>

                {/* Item / Composite ID */}
                <div style={row}>
                  <span style={labelStyle}>Item</span>
                  <input
                    readOnly
                    value={compositeId}
                    style={{
                      ...inputStyle,
                      backgroundColor: isDark ? '#1A1A1A' : '#E8E8E8',
                      color: secondary,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                    }}
                    placeholder="Selecciona la jerarquía"
                  />
                </div>
              </div>

              {/* ─── RIGHT COLUMN: repuesto fields ──────────────────────── */}
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: secondary,
                    margin: '0 0 8px',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Datos del Repuesto
                </p>

                {/* Descripción / nombre */}
                <div style={row}>
                  <span style={labelStyle}>Descripción</span>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleFormChange}
                    style={inputStyle}
                    placeholder="Nombre del repuesto"
                  />
                </div>

                {/* U.Medida */}
                <div style={row}>
                  <span style={labelStyle}>U.Medida</span>
                  <select
                    name="uMedida"
                    value={form.uMedida}
                    onChange={handleFormChange}
                    style={{ ...selectStyle, maxWidth: 90 }}
                  >
                    {['PZA', 'KG', 'LT', 'MT', 'GL', 'UN', 'JGO'].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* No. de Parte */}
                <div style={row}>
                  <span style={labelStyle}>No. de Parte</span>
                  <input
                    name="numeroDeParte"
                    value={form.numeroDeParte}
                    onChange={handleFormChange}
                    style={inputStyle}
                  />
                </div>

                {/* Ubicación */}
                <div style={row}>
                  <span style={labelStyle}>Ubicación</span>
                  <input
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleFormChange}
                    style={inputStyle}
                  />
                </div>

                {/* Especificacion */}
                <div style={row}>
                  <span style={labelStyle}>Especificación</span>
                  <input
                    name="especificacion"
                    value={form.especificacion}
                    onChange={handleFormChange}
                    style={inputStyle}
                  />
                </div>

                {/* Costo U$ */}
                <div style={row}>
                  <span style={labelStyle}>Costo U$</span>
                  <input
                    name="costoUnitario"
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.costoUnitario}
                    onChange={handleFormChange}
                    style={inputStyle}
                    placeholder="0.0000"
                  />
                </div>

                {/* Stock Actual */}
                <div style={row}>
                  <span style={labelStyle}>Stock Actual</span>
                  <input
                    name="stockActual"
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.stockActual}
                    onChange={handleFormChange}
                    style={inputStyle}
                    placeholder="0.000"
                  />
                </div>

                {/* Stock Crítico */}
                <div style={row}>
                  <span style={labelStyle}>Stock Crítico</span>
                  <input
                    name="stockCritico"
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.stockCritico}
                    onChange={handleFormChange}
                    style={inputStyle}
                    placeholder="0.000"
                  />
                </div>

                {/* Descripción larga */}
                <div style={{ marginBottom: 8 }}>
                  <label
                    style={{
                      ...labelStyle,
                      textAlign: 'left',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Descripción extendida
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleFormChange}
                    style={{
                      ...inputStyle,
                      width: '100%',
                      minHeight: 70,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 20,
                borderTop: `1px solid ${inputBorder}`,
                paddingTop: 16,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                style={{
                  ...btnBase,
                  backgroundColor: inputBorder,
                  color: text,
                  minWidth: 90,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  ...btnBase,
                  backgroundColor: colors.brown,
                  color: '#FFF',
                  minWidth: 120,
                }}
              >
                {saving ? 'Guardando...' : 'Grabar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ View Modal ══════════════════════════════════════════════════════*/}
      {viewRepuesto && (
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
          onClick={() => setViewRepuesto(null)}
        >
          <div
            style={{
              backgroundColor: card,
              color: text,
              padding: 24,
              borderRadius: 8,
              width: '100%',
              maxWidth: 1120,
              border: `1px solid ${inputBorder}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: `2px solid ${colors.gold}`,
                paddingBottom: 10,
                marginBottom: 18,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: secondary, fontSize: 16 }}>
                  Detalle del Repuesto
                </h3>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 700,
                    color: colors.gold,
                  }}
                >
                  {getRepuestoCompositeId(viewRepuesto) ||
                    `ID: ${viewRepuesto.id}`}
                </span>
              </div>
              <button
                onClick={() => setViewRepuesto(null)}
                style={{
                  ...btnBase,
                  backgroundColor: 'transparent',
                  color: text,
                  fontSize: 18,
                  padding: '0 6px',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '8px 16px',
              }}
            >
              {(
                [
                  ['Nombre', viewRepuesto.nombre],
                  ['U. Medida', viewRepuesto.uMedida],
                  ['No. de Parte', viewRepuesto.numeroDeParte],
                  ['Ubicación', viewRepuesto.ubicacion],
                  [
                    'Costo U$',
                    viewRepuesto.costoUnitario != null
                      ? `$ ${Number(viewRepuesto.costoUnitario).toFixed(4)}`
                      : '—',
                  ],
                  ['Stock Actual', viewRepuesto.cantidad],
                  ['Stock Crítico', viewRepuesto.stockCritico ?? '—'],
                  ['Correlativo', viewRepuesto.correlativo ?? '—'],
                  ['C.Costo ID', viewRepuesto.centroCosto_id ?? '—'],
                  ['Proceso ID', viewRepuesto.proceso_id ?? '—'],
                  ['Máquina ID', viewRepuesto.maquina_id ?? '—'],
                  ['SubUnidad ID', viewRepuesto.subUnidad_id ?? '—'],
                ] as [string, unknown][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: '8px 10px',
                    borderBottom: `1px solid ${inputBorder}`,
                    backgroundColor: inputBg,
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: secondary,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: 13 }}>{String(value ?? '—')}</div>
                </div>
              ))}
            </div>

            {/* Especificación / Descripción full-width */}
            {viewRepuesto.especificacion && (
              <div
                style={{
                  marginTop: 12,
                  padding: '8px 10px',
                  backgroundColor: inputBg,
                  borderRadius: 4,
                  border: `1px solid ${inputBorder}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: secondary,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Especificación
                </div>
                <div style={{ fontSize: 13 }}>
                  {viewRepuesto.especificacion}
                </div>
              </div>
            )}
            {viewRepuesto.descripcion && (
              <div
                style={{
                  marginTop: 8,
                  padding: '8px 10px',
                  backgroundColor: inputBg,
                  borderRadius: 4,
                  border: `1px solid ${inputBorder}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: secondary,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Descripción
                </div>
                <div style={{ fontSize: 13 }}>{viewRepuesto.descripcion}</div>
              </div>
            )}

            {/* Historial de movimientos */}
            <div
              style={{
                marginTop: 14,
                padding: '10px 12px',
                backgroundColor: inputBg,
                borderRadius: 6,
                border: `1px solid ${inputBorder}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: secondary,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Historial de movimientos (Compras y Salidas)
                </div>
                <div style={{ fontSize: 12, color: secondary }}>
                  Total de movimientos:{' '}
                  <strong>{movimientosRepuesto.length}</strong>
                </div>
              </div>

              <div
                style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto' }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: theadBg,
                        color: isDark ? '#FFF' : colors.darkText,
                        position: 'sticky',
                        top: 0,
                      }}
                    >
                      {[
                        'Fecha',
                        'Tipo',
                        'Referencia',
                        'Cantidad',
                        'Costo U$',
                        'Subtotal',
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '7px 8px',
                            textAlign:
                              h === 'Cantidad' ||
                              h === 'Costo U$' ||
                              h === 'Subtotal'
                                ? 'right'
                                : 'left',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movimientosRepuesto.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'center',
                            padding: 14,
                            color: isDark ? '#888' : '#666',
                          }}
                        >
                          Este repuesto aún no tiene movimientos registrados.
                        </td>
                      </tr>
                    ) : (
                      movimientosRepuesto.map((m, idx) => (
                        <tr
                          key={`${m.tipo}-${m.referencia}-${idx}`}
                          style={{
                            backgroundColor:
                              m.tipo === 'SALIDA'
                                ? isDark
                                  ? 'rgba(229,62,62,0.12)'
                                  : 'rgba(229,62,62,0.08)'
                                : isDark
                                  ? 'rgba(34,197,94,0.12)'
                                  : 'rgba(34,197,94,0.08)',
                          }}
                        >
                          <td
                            style={{
                              padding: '6px 8px',
                              borderBottom: `1px solid ${inputBorder}`,
                            }}
                          >
                            {m.fecha
                              ? new Date(m.fecha).toLocaleDateString('es-ES')
                              : '—'}
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderBottom: `1px solid ${inputBorder}`,
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                color:
                                  m.tipo === 'SALIDA' ? '#E53E3E' : '#22C55E',
                              }}
                            >
                              {m.tipo}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderBottom: `1px solid ${inputBorder}`,
                            }}
                          >
                            {m.referencia}
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderBottom: `1px solid ${inputBorder}`,
                              textAlign: 'right',
                              fontWeight: 700,
                              color:
                                m.tipo === 'SALIDA' ? '#E53E3E' : '#22C55E',
                            }}
                          >
                            {m.tipo === 'SALIDA' ? '-' : '+'}
                            {m.cantidad}
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderBottom: `1px solid ${inputBorder}`,
                              textAlign: 'right',
                            }}
                          >
                            {Number(m.precioUnitario).toFixed(4)}
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderBottom: `1px solid ${inputBorder}`,
                              textAlign: 'right',
                            }}
                          >
                            {Number(m.subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                onClick={() => {
                  setViewRepuesto(null);
                  openEditModal(viewRepuesto);
                }}
                style={{
                  ...btnBase,
                  backgroundColor: '#2196F3',
                  color: '#FFF',
                }}
              >
                Editar
              </button>
              <button
                onClick={() => setViewRepuesto(null)}
                style={{
                  ...btnBase,
                  backgroundColor: inputBorder,
                  color: text,
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
