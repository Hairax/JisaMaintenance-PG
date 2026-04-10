import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { salidaService } from '../services/salida.service';
import { FaPlus, FaSave, FaTrash } from 'react-icons/fa';

interface Usuario {
  id: number;
  nombre?: string;
  name?: string;
  username?: string;
  email?: string;
}

interface OT {
  id: number;
  numeroOt?: string;
  codigo?: string;
  descripcion?: string;
  nombre?: string;
}

interface Repuesto {
  id: number;
  nombre: string;
  uMedida: string;
  costoUnitario: number;
  correlativo: number;
  centroCosto_id: number;
  proceso_id: number;
  maquina_id: number;
  subUnidad_id: number;
  cantidad: number;
  stockCritico?: number;
}

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
  proceso_id: number;
}

interface SubUnidad {
  id: number;
  maquina_id: number;
  descripcion: string;
}

interface RowFilter {
  ccId: string;
  procId: string;
  maqId: string;
  subId: string;
  search: string;
}

interface Producto {
  repuestoId: string;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
}

interface SalidaDetalleApi {
  repuestoId?: number;
  productoId?: number;
  codigo?: string;
  nombre?: string;
  unidadMedida?: string;
  cantidad: number;
  precioUnitario: number;
}

interface SalidaApi {
  id: number;
  usuarioId: number;
  otId: number;
  fecha: string;
  observacion?: string;
  almacen?: string;
  detalles?: SalidaDetalleApi[];
  alertasStockCritico?: string[];
}

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

const EMPTY_PRODUCTO: Producto = {
  repuestoId: '',
  codigo: '',
  nombre: '',
  unidadMedida: '',
  cantidad: 0,
  precioUnitario: 0,
};

const EMPTY_FILTER: RowFilter = {
  ccId: '',
  procId: '',
  maqId: '',
  subId: '',
  search: '',
};

function padId(n: number, digits: number) {
  return String(n).padStart(digits, '0');
}

function getCompositeId(r: Repuesto): string {
  return [
    r.centroCosto_id ? String(r.centroCosto_id) : '',
    r.proceso_id ? String(r.proceso_id) : '',
    r.maquina_id ? String(r.maquina_id) : '',
    r.subUnidad_id ? String(r.subUnidad_id) : '',
  ]
    .filter(Boolean)
    .concat(r.subUnidad_id ? [padId(r.correlativo ?? 0, 3)] : [])
    .join('.');
}

function getUsuarioName(u: Usuario): string {
  return u.nombre ?? u.name ?? u.username ?? u.email ?? `Usuario ${u.id}`;
}

function getOtName(o: OT): string {
  return o.numeroOt ?? o.codigo ?? o.nombre ?? o.descripcion ?? `OT ${o.id}`;
}

export default function SalidaPage() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEditMode = !!editId;

  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const theadBgColor = theme === 'dark' ? colors.brown : colors.gold;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const tbodyBgColor = theme === 'dark' ? '#232323' : '#FAFAFA';
  const successColor = theme === 'dark' ? '#4ADE80' : '#22863a';
  const errorColor = '#E53E3E';
  const buttonBgColor = '#2196F3';
  const buttonHoverColor = '#0b7dda';
  const addButtonBg = colors.gold;
  const addButtonHover = '#E69D00';

  const [usuarioId, setUsuarioId] = useState('');
  const [otId, setOtId] = useState('');
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  const [almacen, setAlmacen] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [otSearch, setOtSearch] = useState('');

  const [productos, setProductos] = useState<Producto[]>([
    { ...EMPTY_PRODUCTO },
  ]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ots, setOts] = useState<OT[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [subUnidades, setSubUnidades] = useState<SubUnidad[]>([]);
  const [rowFilters, setRowFilters] = useState<RowFilter[]>([
    { ...EMPTY_FILTER },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usrs, otsData, rep, cc, proc, maq, sub] = await Promise.all([
          salidaService.getUsers(),
          salidaService.getOts(),
          salidaService.getRepuestos(),
          fetch('http://localhost:3000/cost-centers').then((r) =>
            r.ok ? r.json() : [],
          ),
          fetch('http://localhost:3000/process').then((r) =>
            r.ok ? r.json() : [],
          ),
          fetch('http://localhost:3000/maquinas').then((r) =>
            r.ok ? r.json() : [],
          ),
          fetch('http://localhost:3000/subunidades').then((r) =>
            r.ok ? r.json() : [],
          ),
        ]);

        setUsuarios(Array.isArray(usrs) ? (usrs as Usuario[]) : []);
        setOts(Array.isArray(otsData) ? (otsData as OT[]) : []);
        const repArray = Array.isArray(rep) ? (rep as Repuesto[]) : [];
        setRepuestos(repArray);
        setCostCenters(Array.isArray(cc) ? (cc as CostCenter[]) : []);
        setProcesses(Array.isArray(proc) ? (proc as Process[]) : []);
        setMaquinas(Array.isArray(maq) ? (maq as Maquina[]) : []);
        setSubUnidades(Array.isArray(sub) ? (sub as SubUnidad[]) : []);

        if (isEditMode && editId) {
          const salida = (await salidaService.getSalida(
            Number(editId),
          )) as SalidaApi;
          setUsuarioId(String(salida.usuarioId || ''));
          setOtId(String(salida.otId || ''));
          if (salida.fecha) {
            setFecha(new Date(salida.fecha).toISOString().split('T')[0]);
          }
          setObservacion(salida.observacion || '');
          setAlmacen(salida.almacen || '');

          if (salida.detalles?.length) {
            setProductos(
              salida.detalles.map((d) => {
                const selectedId = d.repuestoId ?? d.productoId ?? 0;
                const repuesto = repArray.find((r) => r.id === selectedId);
                return {
                  repuestoId: String(selectedId || ''),
                  codigo:
                    d.codigo || (repuesto ? getCompositeId(repuesto) : ''),
                  nombre: d.nombre || repuesto?.nombre || '',
                  unidadMedida: d.unidadMedida || repuesto?.uMedida || 'UN',
                  cantidad: Number(d.cantidad),
                  precioUnitario: Number(d.precioUnitario),
                };
              }),
            );
            setRowFilters(salida.detalles.map(() => ({ ...EMPTY_FILTER })));
          }
        }
      } catch (err) {
        setError('Error al cargar datos del servidor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEditMode, editId]);

  const handleChangeProducto = (
    index: number,
    field: keyof Producto,
    value: string | number,
  ) => {
    const next = [...productos];

    if (field === 'repuestoId') {
      if (
        value &&
        productos.some((p, j) => j !== index && p.repuestoId === String(value))
      ) {
        setError('Este repuesto ya fue agregado en la salida');
        return;
      }
      setError('');
      const selected = repuestos.find((r) => r.id === Number(value));
      if (selected) {
        next[index] = {
          ...next[index],
          repuestoId: String(value),
          codigo: getCompositeId(selected),
          nombre: selected.nombre,
          unidadMedida: selected.uMedida || 'UN',
          precioUnitario: Number(selected.costoUnitario) || 0,
        };
      } else {
        next[index] = {
          ...next[index],
          repuestoId: '',
          codigo: '',
          nombre: '',
          unidadMedida: '',
        };
      }
    } else if (field === 'cantidad' || field === 'precioUnitario') {
      next[index] = { ...next[index], [field]: Number(value) };
    } else {
      next[index] = { ...next[index], [field]: String(value) } as Producto;
    }

    setProductos(next);
  };

  const addProducto = () => {
    setProductos([...productos, { ...EMPTY_PRODUCTO }]);
    setRowFilters([...rowFilters, { ...EMPTY_FILTER }]);
  };

  const removeProducto = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index));
    setRowFilters(rowFilters.filter((_, i) => i !== index));
  };

  const handleRowFilter = (
    index: number,
    field: keyof RowFilter,
    value: string,
  ) => {
    const next = [...rowFilters];
    const updated = { ...next[index], [field]: value };

    if (field === 'ccId') {
      updated.procId = '';
      updated.maqId = '';
      updated.subId = '';
    }
    if (field === 'procId') {
      updated.maqId = '';
      updated.subId = '';
    }
    if (field === 'maqId') {
      updated.subId = '';
    }

    next[index] = updated;
    setRowFilters(next);
  };

  const getFilteredRepuestos = (filter: RowFilter) =>
    repuestos.filter((r) => {
      if (filter.ccId && String(r.centroCosto_id) !== filter.ccId) return false;
      if (filter.procId && String(r.proceso_id) !== filter.procId) return false;
      if (filter.maqId && String(r.maquina_id) !== filter.maqId) return false;
      if (filter.subId && String(r.subUnidad_id) !== filter.subId) return false;

      if (filter.search) {
        const s = filter.search.toLowerCase();
        return (
          getCompositeId(r).toLowerCase().includes(s) ||
          r.nombre.toLowerCase().includes(s) ||
          String(r.id).includes(s)
        );
      }
      return true;
    });

  const calcularTotales = () => {
    let subtotal = 0;
    productos.forEach((p) => {
      subtotal += Number(p.cantidad) * Number(p.precioUnitario);
    });
    return { subtotal, total: subtotal };
  };

  const { subtotal, total } = calcularTotales();

  const filteredUsuarios = usuarios.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      String(u.id).includes(q) || getUsuarioName(u).toLowerCase().includes(q)
    );
  });

  const filteredOts = ots.filter((o) => {
    if (!otSearch.trim()) return true;
    const q = otSearch.toLowerCase();
    return String(o.id).includes(q) || getOtName(o).toLowerCase().includes(q);
  });

  const handleGuardarSalida = async () => {
    if (!usuarioId || !otId || !fecha || productos.length === 0) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (productos.some((p) => !p.repuestoId || Number(p.cantidad) <= 0)) {
      setError('Cada detalle debe tener un repuesto y cantidad mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const detalles = productos.map((p) => ({
        repuestoId: Number(p.repuestoId),
        codigo: p.codigo,
        nombre: p.nombre,
        unidadMedida: p.unidadMedida,
        cantidad: Number(p.cantidad),
        precioUnitario: Number(p.precioUnitario),
      }));

      const payload = {
        usuarioId: Number(usuarioId),
        otId: Number(otId),
        fecha: new Date(fecha).toISOString(),
        observacion: observacion || null,
        almacen: almacen || null,
        detalles,
      };

      const result =
        isEditMode && editId
          ? await salidaService.updateSalida(Number(editId), payload)
          : await salidaService.createSalida(payload);

      const okMessage = isEditMode
        ? `Salida #${result?.id ?? editId} actualizada correctamente.`
        : `Salida #${result?.id ?? ''} registrada correctamente.`;

      const warnings = (result?.alertasStockCritico || []) as string[];
      if (warnings.length) {
        alert(`${okMessage}\n\n${warnings.join('\n')}`);
      } else {
        alert(okMessage);
      }

      setUsuarioId('');
      setOtId('');
      setFecha('');
      setObservacion('');
      setAlmacen('');
      setProductos([{ ...EMPTY_PRODUCTO }]);
      setRowFilters([{ ...EMPTY_FILTER }]);
      setUserSearch('');
      setOtSearch('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al guardar salida: ${msg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    border: `1px solid ${inputBorderColor}`,
    borderRadius: 6,
    width: '100%',
    backgroundColor: inputBgColor,
    color: textColor,
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.3rem',
    color: secondaryTextColor,
  };

  const cardStyle: React.CSSProperties = {
    background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    borderRadius: 10,
    border: `1px solid ${inputBorderColor}`,
    marginBottom: '1.5rem',
    overflow: 'hidden',
  };

  const cardHeaderStyle: React.CSSProperties = {
    padding: '0.65rem 1.25rem',
    background: theadBgColor,
    borderBottom: `1px solid ${inputBorderColor}`,
  };

  const cardTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: 700,
    color: theadTextColor,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        maxWidth: 1200,
        margin: '0 auto',
        color: textColor,
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: 4,
            height: 28,
            background: colors.gold,
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
          {isEditMode
            ? `Editar Salida #${editId}`
            : 'Registro de Salida de Repuestos'}
        </h2>
      </div>

      {!loading && (
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'usuarios', count: usuarios.length },
            { label: 'OTs', count: ots.length },
            { label: 'repuestos', count: repuestos.length },
          ].map(({ label, count }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                background: theme === 'dark' ? '#1e3a5f' : '#e3f2fd',
                borderRadius: 20,
                fontSize: '0.78rem',
                color: textColor,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: successColor,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <strong>{count}</strong>&nbsp;{label}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: theme === 'dark' ? '#5f1f1f' : '#ffebee',
            color: errorColor,
            borderRadius: 8,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>!</span> {error}
        </div>
      )}

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h3 style={cardTitleStyle}>Informacion de Salida</h3>
        </div>
        <div
          style={{
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label style={labelStyle}>Nro. Salida</label>
            <input
              style={{ ...inputStyle, fontWeight: 700 }}
              value={isEditMode ? `#${editId}` : 'Se asigna automaticamente'}
              readOnly
            />
          </div>

          <div>
            <label style={labelStyle}>Buscar Usuario</label>
            <input
              style={inputStyle}
              placeholder="Buscar por ID o nombre"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Usuario *</label>
            <select
              style={inputStyle}
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
            >
              <option value="">Seleccione Usuario</option>
              {filteredUsuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.id} - {getUsuarioName(u)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Buscar OT</label>
            <input
              style={inputStyle}
              placeholder="Buscar por ID o nombre"
              value={otSearch}
              onChange={(e) => setOtSearch(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>OT *</label>
            <select
              style={inputStyle}
              value={otId}
              onChange={(e) => setOtId(e.target.value)}
            >
              <option value="">Seleccione OT</option>
              {filteredOts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} - {getOtName(o)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Fecha *</label>
            <input
              style={inputStyle}
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Almacen</label>
            <input
              style={inputStyle}
              placeholder="Ej. Almacen Central"
              value={almacen}
              onChange={(e) => setAlmacen(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Observacion</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              placeholder="Detalle u observaciones de la salida"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h3 style={cardTitleStyle}>
            Repuestos de Salida ({productos.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              backgroundColor: tbodyBgColor,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                  color: textColor,
                }}
              >
                <th
                  style={{
                    padding: '0.6rem 0.75rem',
                    minWidth: 260,
                    textAlign: 'left',
                  }}
                >
                  Repuesto
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'left' }}>
                  Cod.
                </th>
                <th
                  style={{
                    padding: '0.6rem 0.5rem',
                    textAlign: 'left',
                    minWidth: 130,
                  }}
                >
                  Nombre
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                  U.M.
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                  Cant.
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>
                  Precio Bs.
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>
                  Importe
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>
                  Subtotal
                </th>
                <th style={{ padding: '0.6rem 0.5rem', width: 44 }}></th>
              </tr>
            </thead>
            <tbody style={{ color: textColor }}>
              {productos.map((p, i) => {
                const importe = Number(p.cantidad) * Number(p.precioUnitario);
                const rowBg =
                  i % 2 === 0
                    ? tbodyBgColor
                    : theme === 'dark'
                      ? '#1a1a1a'
                      : '#FAFAFA';
                const rf = rowFilters[i] ?? { ...EMPTY_FILTER };

                const filtProc = rf.ccId
                  ? processes.filter((pr) => String(pr.centroCosto) === rf.ccId)
                  : processes;
                const filtMaq = rf.procId
                  ? maquinas.filter((m) => String(m.proceso_id) === rf.procId)
                  : [];
                const filtSub = rf.maqId
                  ? subUnidades.filter((s) => String(s.maquina_id) === rf.maqId)
                  : [];
                const filtRep = getFilteredRepuestos(rf);

                return (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: rowBg,
                      borderBottom: `1px solid ${inputBorderColor}`,
                    }}
                  >
                    <td style={{ padding: '0.5rem', minWidth: 300 }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Buscar por id, codigo o nombre..."
                          style={{ ...inputStyle, fontSize: '0.75rem' }}
                          value={rf.search}
                          onChange={(e) =>
                            handleRowFilter(i, 'search', e.target.value)
                          }
                        />

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 4,
                          }}
                        >
                          <select
                            style={{ ...inputStyle, fontSize: '0.75rem' }}
                            value={rf.ccId}
                            onChange={(e) =>
                              handleRowFilter(i, 'ccId', e.target.value)
                            }
                          >
                            <option value="">C.Costo</option>
                            {costCenters.map((c) => (
                              <option key={c.id} value={String(c.id)}>
                                {c.name}
                              </option>
                            ))}
                          </select>

                          <select
                            style={{ ...inputStyle, fontSize: '0.75rem' }}
                            value={rf.procId}
                            disabled={!rf.ccId}
                            onChange={(e) =>
                              handleRowFilter(i, 'procId', e.target.value)
                            }
                          >
                            <option value="">Proceso</option>
                            {filtProc.map((pr) => (
                              <option key={pr.id} value={String(pr.id)}>
                                {pr.name}
                              </option>
                            ))}
                          </select>

                          <select
                            style={{ ...inputStyle, fontSize: '0.75rem' }}
                            value={rf.maqId}
                            disabled={!rf.procId}
                            onChange={(e) =>
                              handleRowFilter(i, 'maqId', e.target.value)
                            }
                          >
                            <option value="">Maquina</option>
                            {filtMaq.map((m) => (
                              <option key={m.id} value={String(m.id)}>
                                {m.name}
                              </option>
                            ))}
                          </select>

                          <select
                            style={{ ...inputStyle, fontSize: '0.75rem' }}
                            value={rf.subId}
                            disabled={!rf.maqId}
                            onChange={(e) =>
                              handleRowFilter(i, 'subId', e.target.value)
                            }
                          >
                            <option value="">SubUnidad</option>
                            {filtSub.map((s) => (
                              <option key={s.id} value={String(s.id)}>
                                {s.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>

                        <select
                          style={inputStyle}
                          value={p.repuestoId}
                          onChange={(e) =>
                            handleChangeProducto(
                              i,
                              'repuestoId',
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Seleccionar repuesto</option>
                          {filtRep.map((r) => (
                            <option key={r.id} value={r.id}>
                              {getCompositeId(r)} - {r.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td style={{ padding: '0.5rem' }}>
                      <input
                        style={{
                          ...inputStyle,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          width: 90,
                        }}
                        value={p.codigo}
                        readOnly
                      />
                    </td>

                    <td style={{ padding: '0.5rem' }}>
                      <input style={inputStyle} value={p.nombre} readOnly />
                    </td>

                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <input
                        style={{
                          ...inputStyle,
                          width: 55,
                          textAlign: 'center',
                        }}
                        value={p.unidadMedida}
                        readOnly
                      />
                    </td>

                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        style={{
                          ...inputStyle,
                          width: 70,
                          textAlign: 'center',
                        }}
                        value={p.cantidad}
                        onChange={(e) =>
                          handleChangeProducto(
                            i,
                            'cantidad',
                            Number(e.target.value),
                          )
                        }
                      />
                    </td>

                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      <input
                        type="number"
                        step="0.01"
                        style={{ ...inputStyle, width: 80, textAlign: 'right' }}
                        value={p.precioUnitario}
                        onChange={(e) =>
                          handleChangeProducto(
                            i,
                            'precioUnitario',
                            Number(e.target.value),
                          )
                        }
                      />
                    </td>

                    <td
                      style={{
                        padding: '0.5rem',
                        textAlign: 'right',
                        fontWeight: 500,
                      }}
                    >
                      {importe.toFixed(2)}
                    </td>

                    <td
                      style={{
                        padding: '0.5rem',
                        textAlign: 'right',
                        fontWeight: 600,
                      }}
                    >
                      {importe.toFixed(2)}
                    </td>

                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {productos.length > 1 && (
                        <button
                          onClick={() => removeProducto(i)}
                          style={{
                            background: errorColor,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '0.3rem 0.5rem',
                            cursor: 'pointer',
                          }}
                          title="Eliminar fila"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            display: 'flex',
            gap: '0.75rem',
            borderTop: `1px solid ${inputBorderColor}`,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            onClick={addProducto}
            style={{
              background: addButtonBg,
              color: colors.darkText,
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = addButtonHover;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = addButtonBg;
            }}
          >
            <FaPlus /> Agregar Repuesto
          </button>

          <button
            onClick={handleGuardarSalida}
            disabled={loading}
            style={{
              background: loading ? '#999' : buttonBgColor,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.background = buttonHoverColor;
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.background = buttonBgColor;
            }}
          >
            <FaSave />{' '}
            {loading
              ? 'Guardando...'
              : isEditMode
                ? 'Actualizar Salida'
                : 'Guardar Salida'}
          </button>
        </div>
      </div>

      <div
        style={{
          background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          borderRadius: 10,
          border: `1px solid ${inputBorderColor}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.5rem',
          }}
        >
          <div style={{ textAlign: 'center', padding: '0.5rem' }}>
            <p
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: secondaryTextColor,
                margin: '0 0 4px',
                fontWeight: 700,
              }}
            >
              Subtotal
            </p>
            <p
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: textColor,
                margin: 0,
              }}
            >
              {subtotal.toFixed(2)}{' '}
              <span style={{ fontSize: '0.78rem', fontWeight: 400 }}>Bs.</span>
            </p>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '0.75rem',
              background: theme === 'dark' ? '#2a2a2a' : '#FFF8E1',
              borderRadius: 8,
              border: `2px solid ${colors.gold}`,
            }}
          >
            <p
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: secondaryTextColor,
                margin: '0 0 4px',
                fontWeight: 700,
              }}
            >
              Total Salida
            </p>
            <p
              style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                color: colors.gold,
                margin: 0,
              }}
            >
              {total.toFixed(2)}{' '}
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Bs.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
