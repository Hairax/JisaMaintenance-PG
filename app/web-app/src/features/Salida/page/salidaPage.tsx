import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { salidaService } from '../services/salida.service';
import { SearchableSelect } from '../../../shared/components/SearchableSelect';
import { FaSave, FaTrash } from 'react-icons/fa';
import { API_URL } from '../../../shared/config/api';

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
  tipo: 'NORMAL' | 'LIBRE';
  codigoPersonalizado: string;
  nombre: string;
  uMedida: string;
  costoUnitario: number;
  costoUnitarioPonderado?: number;
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

interface Producto {
  repuestoId: string;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  stockActual: number;
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

function padId(n: number, digits: number) {
  return String(n).padStart(digits, '0');
}

function formatDateForInput(value?: string | Date): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalDateToIso(dateString: string): string {
  if (!dateString) return '';
  return new Date(`${dateString}T00:00:00`).toISOString();
}

function getCompositeId(r: Repuesto): string {
  if (r.tipo === 'LIBRE') {
    return r.codigoPersonalizado || String(r.id);
  }
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

  const [usuarioId, setUsuarioId] = useState('');
  const [otId, setOtId] = useState('');
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  const [almacen, setAlmacen] = useState('');

  const [productos, setProductos] = useState<Producto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ots, setOts] = useState<OT[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [subUnidades, setSubUnidades] = useState<SubUnidad[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [ccId, setCcId] = useState('');
  const [procId, setProcId] = useState('');
  const [maqId, setMaqId] = useState('');
  const [subId, setSubId] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockResults, setStockResults] = useState<
    {
      codigo: string;
      nombre: string;
      stockAnterior: number;
      cantidadNueva: number;
      stockNuevo: number;
    }[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usrs, otsData, rep, cc, proc, maq, sub] = await Promise.all([
          salidaService.getUsers(),
          salidaService.getOts(),
          salidaService.getRepuestos(),
          fetch(`${API_URL}/cost-centers`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API_URL}/process`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API_URL}/maquinas`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API_URL}/subunidades`).then((r) => (r.ok ? r.json() : [])),
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
            setFecha(formatDateForInput(salida.fecha));
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
                  stockActual: repuesto ? repuesto.cantidad : 0,
                };
              }),
            );
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

    if (field === 'cantidad') {
      next[index] = { ...next[index], [field]: Number(value) };
    }

    setProductos(next);
  };

  const addRepuestoFromSearch = (repuestoId: string) => {
    if (!repuestoId) return;
    if (productos.some((p) => p.repuestoId === repuestoId)) {
      setError('Este repuesto ya fue agregado en la salida');
      return;
    }
    setError('');
    const selected = repuestos.find((r) => r.id === Number(repuestoId));
    if (selected) {
      const newProducto: Producto = {
        repuestoId: String(repuestoId),
        codigo: getCompositeId(selected),
        nombre: selected.nombre,
        unidadMedida: selected.uMedida || 'UN',
        cantidad: 1,
        precioUnitario:
          Number(selected.costoUnitarioPonderado || selected.costoUnitario) ||
          0,
        stockActual: selected.cantidad,
      };
      setProductos([...productos, newProducto]);
    }
  };

  const removeProducto = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const getFilteredRepuestos = () => {
    return repuestos.filter((r) => {
      if (ccId && String(r.centroCosto_id) !== ccId) return false;
      if (procId && String(r.proceso_id) !== procId) return false;
      if (maqId && String(r.maquina_id) !== maqId) return false;
      if (subId && String(r.subUnidad_id) !== subId) return false;

      if (searchFilter) {
        const s = searchFilter.toLowerCase();
        return (
          getCompositeId(r).toLowerCase().includes(s) ||
          r.nombre.toLowerCase().includes(s) ||
          String(r.id).includes(s)
        );
      }
      return true;
    });
  };

  const calcularTotales = () => {
    let total = 0;
    productos.forEach((p) => {
      total += Number(p.cantidad) * Number(p.precioUnitario);
    });
    return { total };
  };

  const { total } = calcularTotales();

  const filteredUsuarios = usuarios;

  const filteredOts = ots.map((o) => ({
    id: o.id,
    name: getOtName(o),
  }));

  const handleGuardarSalida = async () => {
    if (productos.length === 0) {
      setError('Debe agregar al menos un repuesto');
      return;
    }

    if (productos.some((p) => Number(p.cantidad) <= 0)) {
      setError('Cada detalle debe tener cantidad mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Calculate stock results for modal
      const stockResults = productos.map((p) => ({
        codigo: p.codigo,
        nombre: p.nombre,
        stockAnterior: p.stockActual || 0,
        cantidadNueva: Number(p.cantidad),
        stockNuevo: (p.stockActual || 0) - Number(p.cantidad),
      }));
      setStockResults(stockResults);

      const detalles = productos.map((p) => ({
        repuestoId: Number(p.repuestoId),
        codigo: p.codigo,
        nombre: p.nombre,
        unidadMedida: p.unidadMedida,
        cantidad: Number(p.cantidad),
        precioUnitario: Number(p.precioUnitario),
        stockActual: Number(p.stockActual),
      }));

      const payload = {
        usuarioId: Number(usuarioId),
        otId: Number(otId),
        fecha: formatLocalDateToIso(fecha),
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
      setShowStockModal(true);
      setUsuarioId('');
      setOtId('');
      setFecha('');
      setObservacion('');
      setAlmacen('');
      setProductos([]);
    } catch (err) {
      let errorMsg = 'Error al guardar salida';

      // Intentar extraer el mensaje de error más específico
      if (err instanceof Error) {
        // Si es un error normal, usar su mensaje
        errorMsg = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Si es un objeto, buscar propiedades comunes
        const errObj = err as {
          error?: { message?: string };
          message?: string;
          status?: string;
          details?: string;
        };
        if (errObj.error?.message) {
          errorMsg = errObj.error.message;
        } else if (errObj.message) {
          errorMsg = errObj.message;
        } else if (errObj.status === 'error' && errObj.details) {
          errorMsg = errObj.details;
        }
      } else if (typeof err === 'string') {
        errorMsg = err;
      }

      // Buscar si el mensaje contiene información de stock
      setError(errorMsg);
      console.error('Error al guardar salida:', err);
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
            <label style={labelStyle}>OT *</label>
            <SearchableSelect
              options={filteredOts}
              value={otId}
              onChange={(id) => setOtId(String(id))}
              placeholder="Seleccione OT"
              inputBg={inputBgColor}
              inputBorder={inputBorderColor}
              textColor={textColor}
              secondaryTextColor={secondaryTextColor}
            />
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

        <div
          style={{
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            borderBottom: `1px solid ${inputBorderColor}`,
          }}
        >
          <div>
            <label style={labelStyle}>Centro de Costo</label>
            <select
              style={inputStyle}
              value={ccId}
              onChange={(e) => {
                setCcId(e.target.value);
                setProcId('');
                setMaqId('');
                setSubId('');
              }}
            >
              <option value="">Todos</option>
              {costCenters.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Proceso</label>
            <select
              style={inputStyle}
              value={procId}
              disabled={!ccId}
              onChange={(e) => {
                setProcId(e.target.value);
                setMaqId('');
                setSubId('');
              }}
            >
              <option value="">Todos</option>
              {processes
                .filter((p) => !ccId || String(p.centroCosto) === ccId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Maquina</label>
            <select
              style={inputStyle}
              value={maqId}
              disabled={!procId}
              onChange={(e) => {
                setMaqId(e.target.value);
                setSubId('');
              }}
            >
              <option value="">Todos</option>
              {maquinas
                .filter((m) => !procId || String(m.proceso_id) === procId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Sub-Unidad</label>
            <select
              style={inputStyle}
              value={subId}
              disabled={!maqId}
              onChange={(e) => setSubId(e.target.value)}
            >
              <option value="">Todos</option>
              {subUnidades
                .filter((s) => !maqId || String(s.maquina_id) === maqId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.descripcion}
                  </option>
                ))}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Buscar Repuesto</label>
            <input
              style={inputStyle}
              placeholder="Buscar por ID, código o nombre"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Seleccionar Repuesto</label>
            <select
              style={inputStyle}
              value=""
              onChange={(e) => addRepuestoFromSearch(e.target.value)}
            >
              <option value="">Seleccione un repuesto para agregar</option>
              {getFilteredRepuestos().map((r) => (
                <option key={r.id} value={r.id}>
                  {getCompositeId(r)} - {r.nombre}
                </option>
              ))}
            </select>
          </div>
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
                    textAlign: 'left',
                    minWidth: 200,
                  }}
                >
                  Repuesto
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                  U.M.
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                  Stock Actual
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                  Cant.
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>
                  Precio Bs.
                </th>
                <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>
                  Subtotal
                </th>
                <th style={{ padding: '0.6rem 0.5rem', width: 44 }}></th>
              </tr>
            </thead>
            <tbody style={{ color: textColor }}>
              {productos.map((p, i) => {
                const subtotal = Number(p.cantidad) * Number(p.precioUnitario);
                const rowBg =
                  i % 2 === 0
                    ? tbodyBgColor
                    : theme === 'dark'
                      ? '#1a1a1a'
                      : '#FAFAFA';

                return (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: rowBg,
                      borderBottom: `1px solid ${inputBorderColor}`,
                    }}
                  >
                    <td style={{ padding: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: secondaryTextColor,
                          }}
                        >
                          {p.codigo}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {p.unidadMedida}
                    </td>

                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {p.stockActual}
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
                        readOnly
                      />
                    </td>

                    <td
                      style={{
                        padding: '0.5rem',
                        textAlign: 'right',
                        fontWeight: 600,
                      }}
                    >
                      {subtotal.toFixed(2)}
                    </td>

                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
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
            justifyContent: 'flex-end',
          }}
        >
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
              Total Salida
            </p>
            <p
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: textColor,
                margin: 0,
              }}
            >
              {total.toFixed(2)}{' '}
              <span style={{ fontSize: '0.78rem', fontWeight: 400 }}>Bs.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Modal de stock actualizado */}
      {showStockModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowStockModal(false);
            window.location.href = '/compra/list';
          }}
        >
          <div
            style={{
              background: theme === 'dark' ? '#1e293b' : '#ffffff',
              borderRadius: 12,
              padding: '1.5rem',
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                color: colors.gold,
              }}
            >
              Stock Actualizado
            </h3>
            <p style={{ marginBottom: '1rem', color: textColor }}>
              Los siguientes repuestos han sido actualizados:
            </p>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      color: secondaryTextColor,
                    }}
                  >
                    Código
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      color: secondaryTextColor,
                    }}
                  >
                    Nombre
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '0.5rem',
                      color: secondaryTextColor,
                    }}
                  >
                    Stock Anterior
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '0.5rem',
                      color: secondaryTextColor,
                    }}
                  >
                    Cant. Nueva
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '0.5rem',
                      color: secondaryTextColor,
                    }}
                  >
                    Stock Nuevo
                  </th>
                </tr>
              </thead>
              <tbody>
                {stockResults.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', color: textColor }}>
                      {r.codigo}
                    </td>
                    <td style={{ padding: '0.5rem', color: textColor }}>
                      {r.nombre}
                    </td>
                    <td
                      style={{
                        padding: '0.5rem',
                        textAlign: 'right',
                        color: textColor,
                      }}
                    >
                      {r.stockAnterior}
                    </td>
                    <td
                      style={{
                        padding: '0.5rem',
                        textAlign: 'right',
                        color: colors.gold,
                      }}
                    >
                      -{r.cantidadNueva}
                    </td>
                    <td
                      style={{
                        padding: '0.5rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: successColor,
                      }}
                    >
                      {r.stockNuevo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => {
                setShowStockModal(false);
                window.location.href = '/salidas';
              }}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 2rem',
                background: colors.gold,
                color: '#000',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
