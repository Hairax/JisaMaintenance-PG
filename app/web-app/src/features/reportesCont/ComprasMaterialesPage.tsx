import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { API_URL } from '../../shared/config/api';
import { exportStyledExcel } from '../../shared/utils/accountingExcel';
import {
  AlcanceExport,
  ExportContabilidadModal,
} from '../../shared/components/ExportContabilidadModal';
import { cargarFiltroContable } from '../../shared/utils/contableFilter';

const API = API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompraDetalle {
  id: number;
  compraId: number;
  tipoProducto: 'repuesto' | 'repuesto-maquina';
  productoId: number;
  repuestoId?: number | null;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  precioOriginal: number;
  importe: number;
  porcentajeDescuento: number;
  descuentoMonto: number;
  subtotal: number;
}

interface Compra {
  id: number;
  nroDocumento: string;
  tipoDocumento: string;
  nroFactura: string;
  nit: string;
  proveedorId: number;
  proveedor?: { id: number; nombre?: string; name?: string };
  detalle: string;
  almacen: string;
  fecha: string;
  tipoCambio: number;
  nroAutorizacion: string;
  usuarioId?: number | null;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  detalles: CompraDetalle[];
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const fmtNum = (n: number) =>
  n.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface UsuarioInfo {
  id: number;
  name?: string;
  lastName?: string;
}

const proveedorNombre = (c: Compra) =>
  c.proveedor?.nombre ?? c.proveedor?.name ?? `Proveedor #${c.proveedorId}`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ComprasMaterialesPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [expandido, setExpandido] = useState<number | null>(null);
  const [usuariosMap, setUsuariosMap] = useState<Record<number, UsuarioInfo>>(
    {},
  );
  const [modalExport, setModalExport] = useState(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, resUsers] = await Promise.all([
        fetch(`${API}/compras`),
        fetch(`${API}/users`),
      ]);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: Compra[] = await res.json();
      setCompras(Array.isArray(data) ? data : []);

      const users: UsuarioInfo[] = resUsers.ok ? await resUsers.json() : [];
      setUsuariosMap(
        Object.fromEntries(
          (Array.isArray(users) ? users : []).map((u) => [u.id, u]),
        ),
      );
    } catch (err) {
      console.error(err);
      setError(
        'Error al cargar las compras. Verifique la conexión con el servidor.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const proveedores = useMemo(
    () => ['todos', ...Array.from(new Set(compras.map(proveedorNombre)))],
    [compras],
  );

  const dataFiltrada = useMemo(
    () =>
      compras.filter((c) => {
        const fechaStr = c.fecha ? c.fecha.slice(0, 10) : '';
        const matchFiltro =
          !filtro ||
          c.nroDocumento?.toLowerCase().includes(filtro.toLowerCase()) ||
          c.nroFactura?.toLowerCase().includes(filtro.toLowerCase()) ||
          c.detalle?.toLowerCase().includes(filtro.toLowerCase()) ||
          (c.detalles ?? []).some((d) =>
            d.nombre?.toLowerCase().includes(filtro.toLowerCase()),
          );
        const matchProveedor =
          filtroProveedor === 'todos' ||
          !filtroProveedor ||
          proveedorNombre(c) === filtroProveedor;
        const matchInicio = !fechaInicio || fechaStr >= fechaInicio;
        const matchFin = !fechaFin || fechaStr <= fechaFin;
        return matchFiltro && matchProveedor && matchInicio && matchFin;
      }),
    [compras, filtro, filtroProveedor, fechaInicio, fechaFin],
  );

  const exportarExcel = () => {
    // Definimos el orden estricto de las columnas basándonos en la imagen de reporte_compras
    const headers = [
      'N° Documento',
      'Tipo Doc.',
      'N° Factura',
      'NIT',
      'Proveedor',
      'Almacén',
      'Detalle',
      'Fecha',
      'Código',
      'Material',
      'U.M.',
      'Cantidad',
      'P. Unit. Bs',
      'Precio Original Bs',
      'Descuento Bs',
      'Subtotal Bs',
      'Costo Bs',
      'Valorado Bs.',
    ];

    // Array de arrays: la primera fila serán los encabezados obligatoriamente
    const datosHoja: (string | number | Date)[][] = [headers];

    for (const c of dataFiltrada) {
      // Si la compra no tiene detalles, evitamos que rompa metiendo campos vacíos alineados
      const detalles =
        (c.detalles ?? []).length === 0
          ? [
              {
                nombre: '',
                codigo: '',
                unidadMedida: '',
                cantidad: 0,
                precioUnitario: 0,
                precioOriginal: 0,
                porcentajeDescuento: 0,
                subtotal: 0,
              },
            ]
          : c.detalles;

      for (const d of detalles) {
        // --- 1. Mapeo y formateo estricto de tipos de datos ---

        // Celdas numéricas con fallback a 0 para que Excel no reciba NaN o undefined
        const cantidad = Number(d.cantidad) || 0;
        const pUnitario = Number(d.precioUnitario) || 0;
        const precioOriginalBs = Number(d.precioOriginal) || 0;
        const descuentoBs = Number(c.descuentoTotal) || 0; // O la lógica que manejes por ítem
        const subtotal = Number(d.subtotal) || 0;

        // Lógica de Costo (según tu Excel suele ser igual al subtotal o pUnitario según la estructura)
        const costoBs = subtotal;

        // Nueva columna solicitada: Precio menos el 13% de IVA (Valorado Bs.)
        const valoradoBs = subtotal * 0.87;

        // Fecha como objeto Date nativo (imprescindible para que Excel lo reconozca como tipo Fecha)
        const fechaObjeto = c.fecha ? new Date(c.fecha) : '';

        // Construimos la fila respetando rigurosamente el orden de las columnas de la captura
        const fila = [
          c.nroDocumento || '',
          c.tipoDocumento || '',
          c.nroFactura || '',
          c.nit || '',
          proveedorNombre(c),
          c.almacen || '',
          c.detalle || '',
          fechaObjeto, // Columna H: Fecha (Tipo Date)
          d.codigo || '', // Columna I: Código
          d.nombre, // Columna J: Material
          d.unidadMedida, // Columna K: U.M.
          cantidad, // Columna L: Cantidad (Tipo Number)
          pUnitario, // Columna M: P. Unit. Bs (sin impuesto, Tipo Number)
          precioOriginalBs, // Columna N: Precio Original Bs (con impuesto, tal cual factura)
          descuentoBs, // Columna O: Descuento Bs (Tipo Number)
          subtotal, // Columna P: Subtotal Bs (Tipo Number)
          costoBs, // Columna Q: Costo Bs (Tipo Number)
          valoradoBs, // Columna R: Valorado Bs. (Precio menos 13%) (Tipo Number)
        ];

        datosHoja.push(fila);
      }
    }

    // Creamos la hoja directamente desde un Array de Arrays (aoa) para asegurar el orden de columnas
    const hoja = XLSX.utils.aoa_to_sheet(datosHoja);

    // --- 2. Forzar formatos de celda en Excel ---
    // Nos aseguramos de que Excel sepa cómo renderizar visualmente los números sin perder el tipo "number"
    const rango = XLSX.utils.decode_range(hoja['!ref'] || 'A1:A1');
    for (let R = 1; R <= rango.e.r; ++R) {
      // Empezamos en 1 para saltarnos los encabezados

      // Formato para columnas de dinero (M, N, O, P, Q, R) -> ÍNDICES: 12, 13, 14, 15, 16, 17
      const columnasMoneda = [12, 13, 14, 15, 16, 17];
      columnasMoneda.forEach((colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: colIdx });
        if (hoja[cellRef] && hoja[cellRef].t === 'n') {
          hoja[cellRef].z = '#,##0.00'; // Formato numérico estándar de contabilidad/decimales
        }
      });

      // Formato para la columna de Cantidad (Columna L -> Índice 11)
      const cantRef = XLSX.utils.encode_cell({ r: R, c: 11 });
      if (hoja[cantRef] && hoja[cantRef].t === 'n') {
        hoja[cantRef].z = '#,##0'; // Enteros o decimales simples
      }

      // Formato para la columna de Fecha (Columna H -> Índice 7)
      const fechaRef = XLSX.utils.encode_cell({ r: R, c: 7 });
      if (hoja[fechaRef] && hoja[fechaRef].t === 'd') {
        hoja[fechaRef].z = 'dd/mm/yyyy'; // Formato de fecha para es-BO
      }
    }

    const libro = XLSX.utils.book_new();

    // cellDates: true es VITAL para que la librería no transforme los objetos Date en strings numéricos extraños
    XLSX.utils.book_append_sheet(libro, hoja, 'Compras');
    XLSX.writeFile(libro, 'reporte_compras.xlsx', { cellDates: true });
  };

  // Export para contabilidad: columnas exactas de Plantilla_Compras.xlsx,
  // una fila por cada línea de detalle. Responsable = usuario que registró o
  // editó la compra por última vez; index UM va siempre en 0 (indicado por
  // contabilidad). Las columnas que el sistema no registra hoy (Tipo Pago,
  // Plazo, Moneda, Empresa/Categoría/Línea/Marca de producto) quedan vacías.
  // Con alcance 'contables' se omiten las líneas de repuestos no contables.
  const exportarContabilidad = async (alcance: AlcanceExport) => {
    const esContable =
      alcance === 'contables' ? await cargarFiltroContable() : () => true;
    const nombreUsuario = (id?: number | null) => {
      const u = id != null ? usuariosMap[id] : undefined;
      return u ? `${u.name ?? ''} ${u.lastName ?? ''}`.trim() : '';
    };

    const headers = [
      'Fecha',
      'codigo',
      'N° factura',
      'Cod. autorizacion',
      'Fecha Factura',
      'Cod. Proveedor',
      'Nom. Proveedor',
      'Cod. Responsable',
      'Nom. Responsable',
      'Tipo Pago (contado/credito)',
      'Plazo',
      'Moneda (bs/us)',
      'TC',
      'Cod. producto',
      'Nom. producto',
      'Cantidad',
      'Precio',
      'Descuento x prd.',
      'Costo',
      'index UM (0=um1,1=um2,2=um3)',
      'unidades UM',
      'Empresa prd.',
      'Categoria prd.',
      'Linea prd.',
      'Marca prd.',
      'Detalle Compra',
    ];
    const columnWidths = [
      6.11, 6.78, 9.55, 16.22, 13, 13.89, 14.66, 16.55, 17.33, 25.22, 5.66,
      14.55, 3.11, 13, 13.89, 8.78, 6.33, 15.11, 5.78, 29.11, 12.22, 12.33, 13,
      9.44, 10.22, 14.11,
    ];

    const rows: (string | number)[][] = [];
    for (const c of dataFiltrada) {
      const lineas = (c.detalles ?? []).filter((d) => esContable(d.repuestoId));
      // Compra cuyas líneas eran todas no contables: no aporta nada al export.
      if (lineas.length === 0 && (c.detalles ?? []).length > 0) continue;
      const detalles =
        lineas.length === 0
          ? [
              {
                codigo: '',
                nombre: '',
                unidadMedida: '',
                cantidad: 0,
                precioOriginal: 0,
                descuentoMonto: 0,
                precioUnitario: 0,
              },
            ]
          : lineas;

      for (const d of detalles) {
        rows.push([
          fmtDate(c.createdAt),
          c.nroDocumento || '',
          c.nroFactura || '',
          c.nroAutorizacion || '',
          fmtDate(c.fecha),
          c.proveedorId ?? '',
          proveedorNombre(c),
          c.usuarioId ?? '',
          nombreUsuario(c.usuarioId),
          '', // Tipo Pago — sin dato
          '', // Plazo — sin dato
          '', // Moneda — sin dato
          Number(c.tipoCambio) || 0,
          d.codigo || '',
          d.nombre,
          Number(d.cantidad) || 0,
          Number(d.precioOriginal) || 0,
          Number(d.descuentoMonto) || 0,
          Number(d.precioUnitario) || 0,
          0, // index UM
          d.unidadMedida,
          '', // Empresa prd. — sin dato
          '', // Categoria prd. — sin dato
          '', // Linea prd. — sin dato
          '', // Marca prd. — sin dato
          c.detalle || '',
        ]);
      }
    }

    await exportStyledExcel({
      filename: 'compras_contabilidad.xlsx',
      sheetName: 'Hoja1',
      headers,
      columnWidths,
      rows,
    });
  };

  if (loading)
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--app-text-subtle)',
        }}
      >
        Cargando compras...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#C62828', marginBottom: 12 }}>{error}</p>
        <button
          onClick={cargarDatos}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: 8,
            background: '#FBAF11',
            color: '#fff',
            border: 'none',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );

  return (
    <div
      style={{
        padding: 'clamp(1rem, 4vw, 2rem)',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: 'var(--app-surface)',
          borderRadius: 12,
          boxShadow: 'var(--app-shadow)',
          padding: 'clamp(1rem, 4vw, 2rem)',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          Registro de Compras de Materiales e Insumos
        </h2>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Buscar por material, doc. o detalle..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid var(--app-border)',
              minWidth: 220,
              flex: 1,
            }}
          />
          <select
            value={filtroProveedor}
            onChange={(e) => setFiltroProveedor(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid var(--app-border)',
            }}
          >
            {proveedores.map((p) => (
              <option key={p} value={p}>
                {p === 'todos' ? 'Todos los proveedores' : p}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{ fontSize: '0.72rem', color: 'var(--app-text-subtle)' }}
            >
              Fecha inicio
            </span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--app-border)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{ fontSize: '0.72rem', color: 'var(--app-text-subtle)' }}
            >
              Fecha fin
            </span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--app-border)',
              }}
            />
          </div>
          <button
            onClick={() => {
              setFiltro('');
              setFiltroProveedor('');
              setFechaInicio('');
              setFechaFin('');
            }}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#FBAF11',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Limpiar
          </button>
          <button
            onClick={cargarDatos}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#1565C0',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Actualizar
          </button>
          <button
            onClick={exportarExcel}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Exportar a Excel
          </button>
          <button
            onClick={() => setModalExport(true)}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#6A5ACD',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Exportar para Contabilidad
          </button>
        </div>

        {/* Summary pills */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          {[
            {
              label: 'Compras',
              value: dataFiltrada.length,
              color: 'var(--app-brand-text)',
            },
            {
              label: 'Ítems',
              value: dataFiltrada.reduce(
                (s, c) => s + (c.detalles?.length ?? 0),
                0,
              ),
              color: 'var(--app-text-muted)',
            },
            {
              label: 'Total Bs',
              value: `Bs ${fmtNum(dataFiltrada.reduce((s, c) => s + Number(c.total), 0))}`,
              color: '#155724',
            },
            {
              label: 'Descuentos Bs',
              value: `Bs ${fmtNum(dataFiltrada.reduce((s, c) => s + Number(c.descuentoTotal), 0))}`,
              color: '#721C24',
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: 'var(--app-surface-alt)',
                borderRadius: 8,
                padding: '6px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, color: s.color }}>{s.value}</div>
              <div
                style={{ fontSize: '0.72rem', color: 'var(--app-text-subtle)' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--app-head-bg)' }}>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    width: 28,
                  }}
                />
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Fecha
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  N° Documento
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  N° Factura
                </th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>
                  Proveedor
                </th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>
                  Detalle
                </th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left' }}>
                  Almacén
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Subtotal Bs
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Descuento Bs
                </th>
                <th
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Total Bs
                </th>
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: 'var(--app-brand-accent)',
                    }}
                  >
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
              {dataFiltrada.map((c, i) => {
                const isExp = expandido === c.id;
                return (
                  <>
                    <tr
                      key={c.id}
                      style={{
                        background:
                          i % 2 === 0
                            ? 'var(--app-surface)'
                            : 'var(--app-surface-alt)',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandido(isExp ? null : c.id)}
                    >
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'center',
                          color: 'var(--app-text-subtle)',
                          fontSize: '0.8rem',
                        }}
                      >
                        {isExp ? '▼' : '▶'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fmtDate(c.fecha)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontWeight: 600,
                          color: 'var(--app-brand-text)',
                        }}
                      >
                        {c.nroDocumento || '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--app-text-muted)',
                        }}
                      >
                        {c.nroFactura || '—'}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        {proveedorNombre(c)}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--app-text-muted)',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.detalle || '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          fontSize: '0.82rem',
                        }}
                      >
                        {c.almacen || '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'right',
                        }}
                      >
                        {fmtNum(Number(c.subtotal))}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'right',
                          color: '#721C24',
                        }}
                      >
                        {Number(c.descuentoTotal) > 0
                          ? fmtNum(Number(c.descuentoTotal))
                          : '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: '#155724',
                        }}
                      >
                        {fmtNum(Number(c.total))}
                      </td>
                    </tr>
                    {isExp && (
                      <tr
                        key={`det-${c.id}`}
                        style={{ background: 'var(--app-surface-soft)' }}
                      >
                        <td
                          colSpan={10}
                          style={{ padding: '0 1rem 1rem 2.5rem' }}
                        >
                          {(c.detalles ?? []).length === 0 ? (
                            <p
                              style={{
                                color: 'var(--app-text-subtle)',
                                fontSize: '0.82rem',
                                margin: '0.5rem 0',
                              }}
                            >
                              Sin ítems registrados.
                            </p>
                          ) : (
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.82rem',
                                marginTop: 8,
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    background: 'var(--app-surface-warm)',
                                  }}
                                >
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    Material
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    Código
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    Tipo
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    Cantidad
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'left',
                                    }}
                                  >
                                    U.M.
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    P. Unit. Bs
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    Precio Original Bs
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    Desc. %
                                  </th>
                                  <th
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      textAlign: 'right',
                                    }}
                                  >
                                    Subtotal Bs
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {c.detalles.map((d, di) => (
                                  <tr
                                    key={di}
                                    style={{
                                      background:
                                        di % 2 === 0
                                          ? 'var(--app-surface)'
                                          : 'var(--app-surface-warm)',
                                    }}
                                  >
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        fontWeight: 500,
                                      }}
                                    >
                                      {d.nombre}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        color: 'var(--app-text-subtle)',
                                      }}
                                    >
                                      {d.codigo || '—'}
                                    </td>
                                    <td style={{ padding: '0.5rem 0.75rem' }}>
                                      <span
                                        style={{
                                          padding: '1px 7px',
                                          borderRadius: 8,
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          background:
                                            d.tipoProducto === 'repuesto'
                                              ? '#E3F2FD'
                                              : '#F3E5F5',
                                          color:
                                            d.tipoProducto === 'repuesto'
                                              ? '#1565C0'
                                              : '#6A1B9A',
                                        }}
                                      >
                                        {d.tipoProducto === 'repuesto'
                                          ? 'Repuesto'
                                          : 'Rep. Máq.'}
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                      }}
                                    >
                                      {fmtNum(Number(d.cantidad))}
                                    </td>
                                    <td style={{ padding: '0.5rem 0.75rem' }}>
                                      {d.unidadMedida}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                      }}
                                    >
                                      {fmtNum(Number(d.precioUnitario))}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                        color: 'var(--app-text-subtle)',
                                      }}
                                    >
                                      {fmtNum(Number(d.precioOriginal))}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                        color: '#721C24',
                                      }}
                                    >
                                      {Number(d.porcentajeDescuento) > 0
                                        ? `${Number(d.porcentajeDescuento).toFixed(1)}%`
                                        : '—'}
                                    </td>
                                    <td
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: 'right',
                                        fontWeight: 700,
                                      }}
                                    >
                                      {fmtNum(Number(d.subtotal))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ExportContabilidadModal
        open={modalExport}
        onClose={() => setModalExport(false)}
        onSelect={(alcance) => {
          setModalExport(false);
          exportarContabilidad(alcance).catch((err) => {
            console.error(err);
            setError('Error al generar el Excel para contabilidad.');
          });
        }}
      />
    </div>
  );
}
