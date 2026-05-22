import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { compraService } from '../services/compra.service';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

interface Proveedor {
  id: number;
  nombre: string;
  ruc: string;
}

interface Repuesto {
  id: number;
  tipo: 'NORMAL' | 'LIBRE';
  codigoPersonalizado: string;
  nombre: string;
  uMedida: string;
  costoUnitario: number;
  correlativo: number;
  centroCosto_id: number;
  proceso_id: number;
  maquina_id: number;
  subUnidad_id: number;
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
  centroCosto_id: number;
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
  stockActual: number;
  porcentajeImpuesto: number;
  tipoDescuento: 'PORCENTAJE' | 'MONTO';
  descuentoValor: number;
  porcentajeDescuento: number;
  descuentoMonto: number;
}

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
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

const EMPTY_PRODUCTO: Producto = {
  repuestoId: '',
  codigo: '',
  nombre: '',
  unidadMedida: '',
  cantidad: 0,
  precioUnitario: 0,
  stockActual: 0,
  porcentajeImpuesto: 13,
  tipoDescuento: 'PORCENTAJE',
  descuentoValor: 0,
  porcentajeDescuento: 0,
  descuentoMonto: 0,
};

const EMPTY_FILTER: RowFilter = {
  ccId: '',
  procId: '',
  maqId: '',
  subId: '',
  search: '',
};

export default function CompraInventarioPage() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEditMode = !!editId;

  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  void (theme === 'dark' ? colors.darkBg : colors.lightBg);
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

  const [nroDocumento, setNroDocumento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('Factura');
  const [nroFactura, setNroFactura] = useState('');
  const [nit, setNit] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [detalle, setDetalle] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [fecha, setFecha] = useState('');
  const [tipoCambio, setTipoCambio] = useState('');
  const [nroAutorizacion, setNroAutorizacion] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [subUnidades, setSubUnidades] = useState<SubUnidad[]>([]);
  const [searchFilter, setSearchFilter] = useState<RowFilter>({
    ...EMPTY_FILTER,
  });
  const [selectedSearchRepuesto, setSelectedSearchRepuesto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
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
        const [prov, rep, cc, proc, maq, sub] = await Promise.all([
          compraService.getProveedores(),
          compraService.getRepuestos(),
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
        setProveedores(Array.isArray(prov) ? (prov as Proveedor[]) : []);
        const repArray: Repuesto[] = Array.isArray(rep)
          ? (rep as Repuesto[])
          : [];
        setRepuestos(repArray);
        setCostCenters(Array.isArray(cc) ? (cc as CostCenter[]) : []);
        setProcesses(Array.isArray(proc) ? (proc as Process[]) : []);
        setMaquinas(Array.isArray(maq) ? (maq as Maquina[]) : []);
        setSubUnidades(Array.isArray(sub) ? (sub as SubUnidad[]) : []);
        if (isEditMode && editId) {
          const compra = await compraService.getCompraById(Number(editId));
          setNroDocumento(
            ((compra as Record<string, unknown>).nroDocumento as string) || '',
          );
          setTipoDocumento(
            ((compra as Record<string, unknown>).tipoDocumento as string) ||
              'Factura',
          );
          setNroFactura(
            ((compra as Record<string, unknown>).nroFactura as string) || '',
          );
          setNit(((compra as Record<string, unknown>).nit as string) || '');
          setProveedorId(
            String((compra as Record<string, unknown>).proveedorId || ''),
          );
          setDetalle(
            ((compra as Record<string, unknown>).detalle as string) || '',
          );
          setAlmacen(
            ((compra as Record<string, unknown>).almacen as string) || '',
          );
          const compraFecha = (compra as Record<string, unknown>).fecha as
            | string
            | undefined;
          if (compraFecha) {
            setFecha(formatDateForInput(compraFecha));
          }
          setTipoCambio(
            String((compra as Record<string, unknown>).tipoCambio || ''),
          );
          setNroAutorizacion(
            ((compra as Record<string, unknown>).nroAutorizacion as string) ||
              '',
          );
          const compraDetalles = (compra as Record<string, unknown>)
            .detalles as Record<string, unknown>[] | undefined;
          if (compraDetalles && compraDetalles.length > 0) {
            setProductos(
              compraDetalles.map((d) => {
                const r = repArray.find((x) => x.id === d.repuestoId);
                const pct = Number(d.porcentajeDescuento) || 0;
                const imp = Number(d.cantidad) * Number(d.precioUnitario);
                return {
                  repuestoId: String(d.repuestoId || ''),
                  codigo: (d.codigo as string) || (r ? getCompositeId(r) : ''),
                  nombre: (d.nombre as string) || '',
                  unidadMedida: (d.unidadMedida as string) || '',
                  cantidad: Number(d.cantidad),
                  precioUnitario: Number(d.precioUnitario),
                  stockActual: r?.cantidad || 0,
                  porcentajeImpuesto: Number(d.porcentajeImpuesto) || 13,
                  tipoDescuento: 'PORCENTAJE' as 'PORCENTAJE' | 'MONTO',
                  descuentoValor: pct,
                  porcentajeDescuento: pct,
                  descuentoMonto: (imp * pct) / 100,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeProducto = (
    index: number,
    field: string,
    value: number | string,
  ) => {
    const next = [...productos];
    if (field === 'repuestoId') {
      if (
        value &&
        productos.some((p, j) => j !== index && p.repuestoId === String(value))
      ) {
        setError('Este repuesto ya fue agregado a la compra');
        return;
      }
      setError('');
      const r = repuestos.find((x) => x.id === Number(value));
      if (r) {
        next[index] = {
          ...next[index],
          repuestoId: String(value),
          codigo: getCompositeId(r),
          nombre: r.nombre,
          unidadMedida: r.uMedida || 'unid',
          precioUnitario: r.costoUnitario || 0,
        };
      } else {
        next[index] = { ...next[index], repuestoId: '' };
      }
    } else if (field === 'porcentajeDescuento') {
      const pct = Number(value);
      const importe =
        Number(next[index].cantidad) * Number(next[index].precioUnitario);
      next[index] = {
        ...next[index],
        porcentajeDescuento: pct,
        descuentoMonto: importe > 0 ? (importe * pct) / 100 : 0,
      };
    } else if (field === 'descuentoValor' || field === 'tipoDescuento') {
      const importe =
        Number(next[index].cantidad) * Number(next[index].precioUnitario);
      const valor =
        field === 'descuentoValor' ? Number(value) : next[index].descuentoValor;
      const tipo =
        field === 'tipoDescuento'
          ? (value as 'PORCENTAJE' | 'MONTO')
          : next[index].tipoDescuento;
      if (tipo === 'PORCENTAJE') {
        const pct = valor;
        next[index] = {
          ...next[index],
          tipoDescuento: tipo,
          descuentoValor: valor,
          porcentajeDescuento: pct,
          descuentoMonto: importe > 0 ? (importe * pct) / 100 : 0,
        };
      } else {
        const bs = valor;
        next[index] = {
          ...next[index],
          tipoDescuento: tipo,
          descuentoValor: valor,
          descuentoMonto: bs,
          porcentajeDescuento: importe > 0 ? (bs / importe) * 100 : 0,
        };
      }
    } else if (field === 'cantidad' || field === 'precioUnitario') {
      const newRow = { ...next[index], [field]: Number(value) };
      const importe = Number(newRow.cantidad) * Number(newRow.precioUnitario);
      if (newRow.tipoDescuento === 'PORCENTAJE') {
        newRow.descuentoMonto =
          importe > 0 ? (importe * newRow.porcentajeDescuento) / 100 : 0;
      } else {
        newRow.porcentajeDescuento =
          importe > 0 ? (newRow.descuentoMonto / importe) * 100 : 0;
      }
      next[index] = newRow;
    } else {
      next[index] = { ...next[index], [field]: value };
    }
    setProductos(next);
  };

  const addProducto = () => {
    setProductos([...productos, { ...EMPTY_PRODUCTO }]);
  };
  const removeProducto = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index));
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
          r.nombre.toLowerCase().includes(s)
        );
      }
      return true;
    });

  const handleSearchFilterChange = (field: keyof RowFilter, value: string) => {
    const updated = { ...searchFilter, [field]: value };
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
    setSearchFilter(updated);
  };

  const addRepuestoFromSearch = (value: string) => {
    if (!value) return;
    const rep = repuestos.find((r) => String(r.id) === value);
    if (!rep) return;
    if (productos.some((p) => p.repuestoId === String(rep.id))) {
      setError('Este repuesto ya fue agregado a la compra');
      return;
    }
    setError('');
    setProductos([
      ...productos,
      {
        ...EMPTY_PRODUCTO,
        repuestoId: String(rep.id),
        codigo: getCompositeId(rep),
        nombre: rep.nombre,
        unidadMedida: rep.uMedida || 'unid',
        precioUnitario: rep.costoUnitario || 0,
        stockActual: rep.cantidad || 0,
        porcentajeImpuesto: 13,
      },
    ]);
    setSelectedSearchRepuesto('');
  };

  const handleProveedorChange = (value: string) => {
    setProveedorId(value);
    const proveedor = proveedores.find((p) => String(p.id) === value);
    setNit(proveedor?.ruc ?? '');
  };

  const calcularTotales = () => {
    let subtotal = 0;
    let descuento = 0;
    productos.forEach((p) => {
      const importe = Number(p.cantidad) * Number(p.precioUnitario);
      const descBs = Number(p.descuentoMonto);
      subtotal += importe;
      descuento += descBs;
    });
    return { subtotal, descuento, total: subtotal - descuento };
  };

  const { subtotal, descuento, total } = calcularTotales();

  const handleGuardarCompra = async () => {
    if (
      !nroDocumento ||
      !nroFactura ||
      !nit ||
      !proveedorId ||
      !fecha ||
      productos.length === 0
    ) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }
    try {
      setLoading(true);
      // Calculate stock results for modal
      const stockResults = productos.map((p) => ({
        codigo: p.codigo,
        nombre: p.nombre,
        stockAnterior: p.stockActual || 0,
        cantidadNueva: Number(p.cantidad),
        stockNuevo: (p.stockActual || 0) + Number(p.cantidad),
      }));
      setStockResults(stockResults);

      const detalles = productos.map((p) => ({
        repuestoId: Number(p.repuestoId) || null,
        codigo: p.codigo,
        nombre: p.nombre,
        unidadMedida: p.unidadMedida,
        cantidad: Number(p.cantidad),
        precioUnitario: Number(p.precioUnitario),
        porcentajeDescuento: Number(p.porcentajeDescuento) || 0,
        porcentajeImpuesto: Number(p.porcentajeImpuesto) || 13,
      }));
      const compraData = {
        nroDocumento,
        tipoDocumento,
        nroFactura,
        nit,
        proveedorId: Number(proveedorId),
        detalle,
        almacen,
        fecha: formatLocalDateToIso(fecha),
        tipoCambio: Number(tipoCambio) || 0,
        nroAutorizacion: nroAutorizacion || null,
        detalles,
      };
      if (isEditMode && editId) {
        await compraService.updateCompra(Number(editId), compraData);
        alert('Compra actualizada exitosamente!');
      } else {
        const result = await compraService.createCompra(compraData);
        alert(`Compra guardada exitosamente! ID: ${result.id}`);
      }
      setShowStockModal(true);
      setTipoDocumento('Factura');
      setNroFactura('');
      setNit('');
      setProveedorId('');
      setDetalle('');
      setAlmacen('');
      setFecha('');
      setTipoCambio('');
      setNroAutorizacion('');
      setProductos([{ ...EMPTY_PRODUCTO }]);
      setError('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al guardar: ${msg}`);
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
      {/* Page title */}
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
            ? `Editar Compra #${editId}`
            : 'Registro de Compra de Inventario'}
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
            { label: 'repuestos', count: repuestos.length },
            { label: 'proveedores', count: proveedores.length },
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
          <span>⚠</span> {error}
        </div>
      )}

      {/* Card: Información del Documento */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h3 style={cardTitleStyle}>Información del Documento</h3>
        </div>
        <div
          style={{
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label style={labelStyle}>Nro. Documento *</label>
            <input
              style={inputStyle}
              placeholder="Ej. 001-2024"
              value={nroDocumento}
              onChange={(e) => setNroDocumento(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Proveedor *</label>
            <select
              style={inputStyle}
              value={proveedorId}
              onChange={(e) => handleProveedorChange(e.target.value)}
            >
              <option value="">Seleccione Proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tipo de Documento</label>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: 6 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: textColor,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                <input
                  type="radio"
                  name="doc"
                  value="Factura"
                  checked={tipoDocumento === 'Factura'}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                />
                Factura
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: textColor,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                <input
                  type="radio"
                  name="doc"
                  value="Documento"
                  checked={tipoDocumento === 'Documento'}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                />
                Documento
              </label>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nro. Factura *</label>
            <input
              style={inputStyle}
              placeholder="Ej. F-00123"
              value={nroFactura}
              onChange={(e) => setNroFactura(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>NIT *</label>
            <input
              style={inputStyle}
              placeholder="Ej. 1234567"
              value={nit}
              onChange={(e) => setNit(e.target.value)}
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
            <label style={labelStyle}>Detalle</label>
            <input
              style={inputStyle}
              placeholder="Descripción de la compra"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Almacén</label>
            <input
              style={inputStyle}
              placeholder="Ej. Almacén Central"
              value={almacen}
              onChange={(e) => setAlmacen(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>T.C. Dólar</label>
            <input
              style={inputStyle}
              type="number"
              step="0.01"
              placeholder="Ej. 6.96"
              value={tipoCambio}
              onChange={(e) => setTipoCambio(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Nro. Autorización</label>
            <input
              style={inputStyle}
              placeholder="Opcional"
              value={nroAutorizacion}
              onChange={(e) => setNroAutorizacion(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Card: Productos Comprados */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h3 style={cardTitleStyle}>
            Productos Comprados ({productos.length})
          </h3>
        </div>
        <div
          style={{
            padding: '1rem',
            display: 'grid',
            gap: '1rem',
            borderBottom: `1px solid ${inputBorderColor}`,
            background: theme === 'dark' ? '#181818' : '#fff8e6',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.8fr 1fr',
              gap: '0.75rem',
              alignItems: 'end',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(120px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <input
                type="text"
                placeholder="Buscar producto por código o nombre"
                style={{ ...inputStyle, fontSize: '0.88rem' }}
                value={searchFilter.search}
                onChange={(e) =>
                  handleSearchFilterChange('search', e.target.value)
                }
              />
              <select
                style={{ ...inputStyle, fontSize: '0.88rem' }}
                value={searchFilter.ccId}
                onChange={(e) =>
                  handleSearchFilterChange('ccId', e.target.value)
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
                style={{ ...inputStyle, fontSize: '0.88rem' }}
                value={searchFilter.procId}
                disabled={!searchFilter.ccId}
                onChange={(e) =>
                  handleSearchFilterChange('procId', e.target.value)
                }
              >
                <option value="">Proceso</option>
                {processes
                  .filter((pr) =>
                    searchFilter.ccId
                      ? String(pr.centroCosto) === searchFilter.ccId
                      : true,
                  )
                  .map((pr) => (
                    <option key={pr.id} value={String(pr.id)}>
                      {pr.name}
                    </option>
                  ))}
              </select>
              <select
                style={{ ...inputStyle, fontSize: '0.88rem' }}
                value={searchFilter.maqId}
                disabled={!searchFilter.procId}
                onChange={(e) =>
                  handleSearchFilterChange('maqId', e.target.value)
                }
              >
                <option value="">Máquina</option>
                {maquinas
                  .filter((m) =>
                    searchFilter.procId
                      ? String(m.proceso_id) === searchFilter.procId
                      : true,
                  )
                  .map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.name}
                    </option>
                  ))}
              </select>
              <select
                style={{ ...inputStyle, fontSize: '0.88rem' }}
                value={searchFilter.subId}
                disabled={!searchFilter.maqId}
                onChange={(e) =>
                  handleSearchFilterChange('subId', e.target.value)
                }
              >
                <option value="">SubUnidad</option>
                {subUnidades
                  .filter((s) =>
                    searchFilter.maqId
                      ? String(s.maquina_id) === searchFilter.maqId
                      : true,
                  )
                  .map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.descripcion}
                    </option>
                  ))}
              </select>
            </div>
            <div
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
            >
              <select
                style={{ ...inputStyle, width: '100%', fontSize: '0.95rem' }}
                value={selectedSearchRepuesto}
                onChange={(e) => {
                  setSelectedSearchRepuesto(e.target.value);
                  addRepuestoFromSearch(e.target.value);
                }}
              >
                <option value="">Seleccionar producto</option>
                {getFilteredRepuestos(searchFilter).map((r) => (
                  <option key={r.id} value={r.id}>
                    {getCompositeId(r)} — {r.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addRepuestoFromSearch(selectedSearchRepuesto)}
                style={{
                  background: buttonBgColor,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                <FaPlus /> Agregar
              </button>
            </div>
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
                    minWidth: 220,
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Repuesto
                </th>
                <th
                  style={{
                    padding: '0.6rem 0.5rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  U.M.
                </th>
                <th
                  style={{
                    padding: '0.6rem 0.5rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Stock
                </th>
                <th
                  style={{
                    padding: '0.6rem 0.5rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Cant.
                </th>
                <th
                  style={{
                    padding: '0.6rem 0.5rem',
                    textAlign: 'right',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Precio Bs.
                </th>
                <th
                  style={{
                    padding: '0.6rem 0.5rem',
                    textAlign: 'right',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Importe
                </th>
                <th
                  style={{
                    padding: '0.6rem 0.75rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    minWidth: 110,
                  }}
                >
                  Desc.
                </th>
                <th
                  style={{
                    padding: '0.6rem 0.5rem',
                    textAlign: 'right',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Subtotal
                </th>
                <th style={{ padding: '0.6rem 0.5rem', width: 44 }}></th>
              </tr>
            </thead>
            <tbody style={{ color: textColor }}>
              {productos.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: secondaryTextColor,
                    }}
                  >
                    Selecciona productos desde el buscador superior para agregar
                    a la compra.
                  </td>
                </tr>
              ) : (
                productos.map((p, i) => {
                  const importe = Number(p.cantidad) * Number(p.precioUnitario);
                  const descBs = Number(p.descuentoMonto);
                  const rowSubtotal = importe - descBs;
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
                      <td
                        style={{
                          padding: '0.5rem',
                          minWidth: 320,
                          maxWidth: 420,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: textColor,
                              lineHeight: 1.3,
                            }}
                          >
                            {p.nombre || 'Repuesto seleccionado'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              color: secondaryTextColor,
                            }}
                          >
                            {p.codigo}
                          </span>
                        </div>
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
                      <td
                        style={{
                          padding: '0.5rem',
                          textAlign: 'center',
                          fontWeight: 600,
                          color: successColor,
                        }}
                      >
                        {p.stockActual || 0}
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
                          style={{
                            ...inputStyle,
                            width: 80,
                            textAlign: 'right',
                          }}
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
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <select
                              value={p.tipoDescuento}
                              onChange={(e) =>
                                handleChangeProducto(
                                  i,
                                  'tipoDescuento',
                                  e.target.value,
                                )
                              }
                              style={{
                                ...inputStyle,
                                width: 80,
                                fontSize: '0.75rem',
                              }}
                            >
                              <option value="PORCENTAJE">%</option>
                              <option value="MONTO">Bs</option>
                            </select>
                            <input
                              type="number"
                              style={{
                                ...inputStyle,
                                width: 60,
                                textAlign: 'center',
                              }}
                              value={p.descuentoValor}
                              onChange={(e) =>
                                handleChangeProducto(
                                  i,
                                  'descuentoValor',
                                  Number(e.target.value),
                                )
                              }
                            />
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: secondaryTextColor,
                            }}
                          >
                            -{Number(p.descuentoMonto || 0).toFixed(2)} Bs (
                            {Number(p.porcentajeDescuento || 0).toFixed(2)}%)
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '0.5rem',
                          textAlign: 'right',
                          fontWeight: 600,
                        }}
                      >
                        {rowSubtotal.toFixed(2)}
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card footer: action buttons */}
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
            onClick={handleGuardarCompra}
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
                ? 'Actualizar Compra'
                : 'Guardar Compra'}
          </button>
        </div>
      </div>

      {/* Totals card */}
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
              Descuento
            </p>
            <p
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: colors.gold,
                margin: 0,
              }}
            >
              −{descuento.toFixed(2)}{' '}
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
              Total Neto
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

      {/* Stock Modal */}
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
                      +{r.cantidadNueva}
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
                window.location.href = '/compras';
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
