import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import * as XLSX from 'xlsx';
import { API_URL } from '../../../shared/config/api';

const API = API_URL;

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
  correlativo?: number;
}
interface Maquina {
  id: number;
  name: string;
  centroCosto_id: number;
  proceso_id: number;
  correlativo?: number;
}
interface SubUnidad {
  id: number;
  maquina_id: number;
  descripcion: string;
  correlativo?: number;
}
interface UnidadMedida {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}
interface Almacen {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}
interface Repuesto {
  createdAt: Date;
  id: number;
  tipo: 'NORMAL' | 'LIBRE';
  codigoPersonalizado: string;
  nombre: string;
  descripcion: string;
  uMedida: string;
  almacen: string;
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
  costoUnitarioPonderado?: number;
  aperturaCantidad?: number;
  aperturaCostoUnitario?: number;
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
  otNumero?: number | string;
  otNombre?: string;
}

const EMPTY_FORM = {
  tipo: 'NORMAL' as 'NORMAL' | 'LIBRE',
  codigoPersonalizado: '',
  nombre: '',
  descripcion: '',
  uMedida: 'PZA',
  almacen: '',
  numeroDeParte: '',
  ubicacion: '',
  especificacion: '',
  costoUnitario: '',
  stockActual: '',
  stockCritico: '',
};

function buildRepuestoCompositeId(
  r: Repuesto,
  _costCenters: CostCenter[],
  processes: Process[],
  maquinas: Maquina[],
  subUnidades: SubUnidad[],
) {
  if (r.tipo === 'LIBRE') {
    return r.codigoPersonalizado || String(r.id);
  }

  const parts: string[] = [];

  // Centro de Costo (uso ID ya que no tiene correlativo)
  if (r.centroCosto_id) parts.push(String(r.centroCosto_id));

  // Proceso (uso correlativo)
  if (r.proceso_id) {
    const proc = processes.find((p) => p.id === r.proceso_id);
    const corr = proc?.correlativo ?? r.proceso_id;
    parts.push(String(corr).padStart(2, '0'));
  }

  // Maquina (uso correlativo)
  if (r.maquina_id) {
    const maq = maquinas.find((m) => m.id === r.maquina_id);
    const corr = maq?.correlativo ?? r.maquina_id;
    parts.push(String(corr).padStart(2, '0'));
  }

  // SubUnidad (uso correlativo)
  if (r.subUnidad_id) {
    const sub = subUnidades.find((s) => s.id === r.subUnidad_id);
    const corr = sub?.correlativo ?? r.subUnidad_id;
    parts.push(String(corr).padStart(2, '0'));
  }

  // Correlativo del repuesto mismo
  if (r.subUnidad_id && r.correlativo) {
    parts.push(String(r.correlativo).padStart(3, '0'));
  }

  return parts.join('.');
}

// ── Helper para obtener correlativo de proceso por ID
function getProcessCorrelativo(
  processId: number,
  processes: Process[],
): string {
  const proc = processes.find((p) => p.id === processId);
  const corr = proc?.correlativo ?? processId;
  return String(corr).padStart(2, '0');
}

// ── Helper para obtener correlativo de maquina por ID
function getMaquinaCorrelativo(maquinaId: number, maquinas: Maquina[]): string {
  const maq = maquinas.find((m) => m.id === maquinaId);
  const corr = maq?.correlativo ?? maquinaId;
  return String(corr).padStart(2, '0');
}

// ── Helper para obtener correlativo de subunidad por ID
function getSubunidadCorrelativo(
  subunidadId: number,
  subUnidades: SubUnidad[],
): string {
  const sub = subUnidades.find((s) => s.id === subunidadId);
  const corr = sub?.correlativo ?? subunidadId;
  return String(corr).padStart(2, '0');
}

// ── Helper para construir composite ID del filtro de jerarquia
function buildHierarchyCompositeId(
  ccId: string,
  procId: string,
  maqId: string,
  subId: string,
  correlativo: number,
  processes: Process[],
  maquinas: Maquina[],
  subUnidades: SubUnidad[],
): string {
  const parts: string[] = [];

  if (ccId) parts.push(ccId);
  if (procId) parts.push(getProcessCorrelativo(Number(procId), processes));
  if (maqId) parts.push(getMaquinaCorrelativo(Number(maqId), maquinas));
  if (subId) parts.push(getSubunidadCorrelativo(Number(subId), subUnidades));
  if (subId && correlativo) parts.push(String(correlativo).padStart(3, '0'));

  return parts.join('.');
}

// ── Format helpers for displaying correlatives ─────────────────────────────
function formatProcessName(process: Process): string {
  const correlativo = process.correlativo
    ? String(process.correlativo).padStart(2, '0')
    : '??';
  return `${correlativo} - ${process.name}`;
}

function formatMaquinaName(maquina: Maquina): string {
  const correlativo = maquina.correlativo
    ? String(maquina.correlativo).padStart(2, '0')
    : '??';
  return `${correlativo} - ${maquina.name}`;
}

function formatSubunidadName(subunidad: SubUnidad): string {
  const correlativo = subunidad.correlativo
    ? String(subunidad.correlativo).padStart(2, '0')
    : '??';
  return `${correlativo} - ${subunidad.descripcion}`;
}

// ── Export to Excel ────────────────────────────────────────────────────────
// ── Export to Excel ────────────────────────────────────────────────────────
function exportRepuestosToExcel(
  repuestos: Repuesto[],
  costCenters: CostCenter[],
  processes: Process[],
  maquinas: Maquina[],
  subUnidades: SubUnidad[],
): void {
  const today = new Date();
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  const buildCompositeId = (r: Repuesto) =>
    buildRepuestoCompositeId(r, costCenters, processes, maquinas, subUnidades);

  const data = [
    ['LISTA DE MAESTRA'],
    [`Fecha reporte: ${dateStr}`],
    [],
    [
      'Item', // Se corrigió visualmente el orden de cabeceras según el mapping de abajo
      'Almacen',
      'Nombre',
      'Descripción extendida',
      'Unid.',
      'Stock',
      'Precio Unitario Bs',
      'Precio Total',
    ],
    ...repuestos.map((r) => {
      const precio = Number(r.costoUnitarioPonderado ?? (r.costoUnitario || 0));
      const cantidad = Number(r.cantidad || 0);
      return [
        buildCompositeId(r),
        r.almacen || '',
        r.nombre,
        r.descripcion || '',
        r.uMedida || 'PZA',
        cantidad, // Número puro
        precio, // Número puro
        Number(precio * cantidad), // Número puro
      ];
    }),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const range = XLSX.utils.decode_range(worksheet['!ref'] || '');

  // Desde la fila 5 (índice 4) empiezan los datos
  for (let row = 4; row <= range.e.r; row++) {
    // Columnas numéricas en base a la matriz anterior:
    // F (Stock), G (Precio Unitario), H (Precio Total)
    ['F', 'G', 'H'].forEach((col) => {
      const cellAddress = `${col}${row + 1}`;
      const cell = worksheet[cellAddress];

      if (cell) {
        cell.t = 'n'; // Forzar estrictamente tipo número
        cell.z = '#,##0.00'; // Formato visible de Excel
      }
    });
  }

  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 30 },
    { wch: 35 },
    { wch: 10 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Maestro Repuestos');
  XLSX.writeFile(
    workbook,
    `maestro_repuestos_${dateStr.replace(/\//g, '-')}.xlsx`,
  );
}

function exportRepuestoKardexToExcel(
  repuesto: Repuesto,
  movimientos: MovimientoRepuesto[],
  costCenters: CostCenter[],
  processes: Process[],
  maquinas: Maquina[],
  subUnidades: SubUnidad[],
): void {
  const today = new Date();
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  const codigo = buildRepuestoCompositeId(
    repuesto,
    costCenters,
    processes,
    maquinas,
    subUnidades,
  );
  let saldoCantidad = 0;
  let saldoValor = 0;

  const rows = movimientos
    .slice()
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map((m) => {
      const ingreso = m.tipo === 'COMPRA' ? Number(m.cantidad) : 0;
      const salida = m.tipo === 'SALIDA' ? Number(m.cantidad) : 0;
      const ingresosBs = ingreso * Number(m.precioUnitario);
      const salidasBs = salida * Number(m.precioUnitario);
      saldoCantidad += ingreso - salida;
      saldoValor += ingresosBs - salidasBs;

      // Definimos los valores por defecto
      const nroDocumento = m.referencia || '—';
      let otNumero: number | string = '—';

      // Si es una salida, extraemos la información de la OT procesada en el Paso 2
      if (m.tipo === 'SALIDA') {
        if (m.otNumero) otNumero = m.otNumero;
      }

      return [
        nroDocumento, // Columna A (Texto)
        typeof otNumero === 'number' ||
        (!isNaN(Number(otNumero)) && otNumero !== '')
          ? Number(otNumero)
          : otNumero, // Columna B (Número puro si aplica)
        m.fecha ? new Date(m.fecha).toLocaleDateString('es-ES') : '—', // Columna D
        m.tipo === 'COMPRA' ? 'Ingreso' : 'Salida', // Columna E
        ingreso, // Columna F (Número)
        salida, // Columna G (Número)
        saldoCantidad, // Columna H (Número)
        Number(m.precioUnitario), // Columna I (Número)
        ingresosBs, // Columna J (Número)
        salidasBs, // Columna K (Número)
        saldoValor, // Columna L (Número)
      ];
    });

  const worksheet = XLSX.utils.aoa_to_sheet([
    ['JACHA INTI INDUSTRIAL S.A.'],
    [],
    ['KARDEX'],
    [],
    ['Código:', codigo, '', 'Nombre:', repuesto.nombre],
    ['Fecha reporte:', dateStr],
    [],
    [
      'Nro. Documento', // Columna A
      'Nro. OT', // Columna B (Numérica)
      'Fecha', // Columna D
      'Tipo', // Columna E
      'Ingresos', // Columna F
      'Salidas', // Columna G
      'Saldo', // Columna H
      'Costo Unitario Bs', // Columna I
      'Costo Ingresos Bs', // Columna J
      'Costo Salidas Bs', // Columna K
      'Saldo Val. Bs', // Columna L
    ],
    ...rows,
  ]);

  const range = XLSX.utils.decode_range(worksheet['!ref'] || '');

  // Ajustamos el bucle de formato para las nuevas posiciones de columnas
  // Las cabeceras están en la fila 8 (índice 7), los datos empiezan en la fila 9 (índice 8)
  for (let row = 8; row <= range.e.r; row++) {
    // 1. Validar y formatear la columna "Nro. OT" (Columna B) si contiene un número válido
    const otCellAddress = `B${row + 1}`;
    const otCell = worksheet[otCellAddress];
    if (otCell && otCell.v !== '—' && !isNaN(Number(otCell.v))) {
      otCell.t = 'n'; // Forzar tipo número
      otCell.z = '#,##0'; // Formato entero sin decimales para números de orden
    }

    // 2. Formatear las columnas de importes y existencias (Desde la F hasta la L)
    // F=Ingresos, G=Salidas, H=Saldo, I=Costo Unit, J=Costo Ing, K=Costo Sal, L=Saldo Val
    ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].forEach((col) => {
      const cellAddress = `${col}${row + 1}`;
      const cell = worksheet[cellAddress];
      if (cell) {
        cell.t = 'n'; // Tipo número estricto
        cell.z = col === 'I' ? '#,##0.0000' : '#,##0.00';
      }
    });
  }

  // Configuración de anchos de columna óptimos
  worksheet['!cols'] = [
    { wch: 18 }, // Nro. Documento
    { wch: 12 }, // Nro. OT
    { wch: 14 }, // Fecha
    { wch: 12 }, // Tipo
    { wch: 10 }, // Ingresos
    { wch: 10 }, // Salidas
    { wch: 10 }, // Saldo
    { wch: 16 }, // Costo Unitario Bs
    { wch: 16 }, // Costo Ingresos Bs
    { wch: 16 }, // Costo Salidas Bs
    { wch: 16 }, // Saldo Val. Bs
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kardex Repuesto');
  XLSX.writeFile(workbook, `kardex_repuesto_${codigo || repuesto.id}.xlsx`);
}

// ── Export Critical Stock to Excel ─────────────────────────────────────────
function exportCriticalStockToExcel(
  repuestos: Repuesto[],
  costCenters: CostCenter[],
  processes: Process[],
  maquinas: Maquina[],
  subUnidades: SubUnidad[],
): void {
  const criticalRepuestos = repuestos.filter(
    (r) => r.stockCritico != null && r.cantidad <= r.stockCritico,
  );

  if (criticalRepuestos.length === 0) {
    alert('No hay repuestos con stock crítico para exportar');
    return;
  }

  const today = new Date();
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  const buildCompositeId = (r: Repuesto) =>
    buildRepuestoCompositeId(r, costCenters, processes, maquinas, subUnidades);

  const worksheet = XLSX.utils.aoa_to_sheet([
    ['REQUERIMIENTO DE COMPRA'],
    ['Área:', 'MANTENIMIENTO'],
    ['Cargo:', 'Técnico de Almacén de mantenimiento'],
    ['Fecha de Solicitud:', dateStr],
    ['Número de Requerimiento:', ''],
    [],
    [
      'ALMACEN',
      'CÓDIGO',
      'DESCRIPCIÓN',
      'MEDIDA',
      'CANTIDAD',
      'PRIORIDAD',
      'USO',
    ],
    ...criticalRepuestos.map((r) => [
      buildCompositeId(r),
      r.nombre,
      r.descripcion || '',
      r.uMedida || 'PZA',
      Number(r.cantidad || 0), // Aseguramos número puro aquí
      '',
      '',
    ]),
  ]);

  const range = XLSX.utils.decode_range(worksheet['!ref'] || '');

  // Formatear la columna de CANTIDAD (Columna E) empezando desde la fila 8 (índice 7)
  for (let row = 7; row <= range.e.r; row++) {
    const cellAddress = `E${row + 1}`;
    const cell = worksheet[cellAddress];
    if (cell) {
      cell.t = 'n';
      cell.z = '#,##0'; // Formato entero para cantidades físicas de stock
    }
  }

  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 25 },
    { wch: 35 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Requerimiento Compra');
  XLSX.writeFile(
    workbook,
    `requerimiento_compra_${dateStr.replace(/\//g, '-')}.xlsx`,
  );
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
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [almacen, setAlmacen] = useState<Almacen[]>([]);
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
  const [recalculating, setRecalculating] = useState(false);
  const [showUnidadMedidaModal, setShowUnidadMedidaModal] = useState(false);
  const [unidadMedidaMode, setUnidadMedidaMode] = useState<'add' | 'edit'>(
    'add',
  );
  const [almacenMode, setAlmacenMode] = useState<'add' | 'edit'>('add');
  const [editUmId, setEditUmId] = useState<number | null>(null);
  const [umForm, setUmForm] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
  });
  const [alForm, setAlForm] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
  });
  const [showAlmacenModal, setShowAlmacenModal] = useState(false);
  const [editAlmacenId, setEditAlmacenId] = useState<number | null>(null);
  const [alLoading, setAlLoading] = useState(false);
  const [umLoading, setUmLoading] = useState(false);

  // ── Load catalogs on mount ──────────────────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cc, proc, maq, sub, um, al, rep, compras, salidas] =
        await Promise.all([
          fetch(`${API}/cost-centers`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/process`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/maquinas`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/subunidades`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/unidades-medida`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/almacen`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/repuestos`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/compras`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API}/salidas`).then((r) => (r.ok ? r.json() : [])),
        ]);
      console.log(rep);
      setCostCenters(Array.isArray(cc) ? cc : []);
      setProcesses(Array.isArray(proc) ? proc : []);
      setMaquinas(Array.isArray(maq) ? maq : []);
      setSubUnidades(Array.isArray(sub) ? sub : []);
      setUnidadesMedida(Array.isArray(um) ? um : []);
      setAlmacen(Array.isArray(al) ? al : []);
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
  const compositeId = buildHierarchyCompositeId(
    ccId,
    procId,
    maqId,
    subId,
    correlativo,
    processes,
    maquinas,
    subUnidades,
  );

  const getRepuestoCompositeId = (r: Repuesto) =>
    buildRepuestoCompositeId(r, costCenters, processes, maquinas, subUnidades);

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
      tipo: rep.tipo,
      codigoPersonalizado: rep.codigoPersonalizado ?? '',
      nombre: rep.nombre,
      descripcion: rep.descripcion ?? '',
      uMedida: rep.uMedida || 'PZA',
      almacen: rep.almacen || '',
      numeroDeParte: rep.numeroDeParte ?? '',
      ubicacion: rep.ubicacion ?? '',
      especificacion: rep.especificacion ?? '',
      // Pre-fill form costoUnitario with the ponderado value if available
      costoUnitario: String(rep.costoUnitarioPonderado ?? rep.costoUnitario),
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
        tipo: form.tipo,
        codigoPersonalizado: form.codigoPersonalizado || undefined,
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        uMedida: form.uMedida || undefined,
        almacen: form.almacen || undefined,
        numeroDeParte: form.numeroDeParte || undefined,
        ubicacion: form.ubicacion || undefined,
        especificacion: form.especificacion || undefined,
        costoUnitario: Number(form.costoUnitario) || 0,
        cantidad: Number(form.stockActual) || 0,
        stockCritico: form.stockCritico ? Number(form.stockCritico) : undefined,
        ...(form.tipo === 'NORMAL' && {
          correlativo: correlativo || undefined,
          centroCosto_id: ccId ? Number(ccId) : undefined,
          proceso_id: procId ? Number(procId) : undefined,
          maquina_id: maqId ? Number(maqId) : undefined,
          subUnidad_id: subId ? Number(subId) : undefined,
        }),
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

  // ── Unidad Medida CRUD handlers ──────────────────────────────────────────────
  const handleOpenUmModal = (um?: UnidadMedida) => {
    if (um) {
      setUmForm({
        nombre: um.nombre,
        codigo: um.codigo,
        descripcion: um.descripcion || '',
      });
      setEditUmId(um.id);
      setUnidadMedidaMode('edit');
    } else {
      setUmForm({ nombre: '', codigo: '', descripcion: '' });
      setEditUmId(null);
      setUnidadMedidaMode('add');
    }
    setShowUnidadMedidaModal(true);
  };

  const handleCloseUmModal = () => {
    setShowUnidadMedidaModal(false);
    setUmForm({ nombre: '', codigo: '', descripcion: '' });
    setEditUmId(null);
  };

  // -- Alamacen CRUD handlers --
  const handleOpenAlmacenModal = (alm?: Almacen) => {
    if (alm) {
      setAlForm({
        nombre: alm.nombre,
        codigo: alm.codigo,
        descripcion: alm.descripcion || '',
      });
      setEditAlmacenId(alm.id);
      setAlmacenMode('edit');
    } else {
      setAlForm({ nombre: '', codigo: '', descripcion: '' });
      setEditAlmacenId(null);
      setAlmacenMode('add');
    }
    setShowAlmacenModal(true);
  };

  const handleCloseAlmacenModal = () => {
    setShowAlmacenModal(false);
    setAlForm({ nombre: '', codigo: '', descripcion: '' });
    setEditAlmacenId(null);
  };

  const handleUmFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUmForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAlFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setAlForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUm = async () => {
    if (!umForm.nombre.trim() || !umForm.codigo.trim()) {
      setError('Nombre y código son requeridos');
      return;
    }
    setUmLoading(true);
    try {
      const url =
        unidadMedidaMode === 'add'
          ? `${API}/unidades-medida`
          : `${API}/unidades-medida/${editUmId}`;
      const method = unidadMedidaMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(umForm),
      });
      if (!res.ok) throw new Error('Error al guardar');
      await loadAll();
      handleCloseUmModal();
    } catch (e) {
      setError((e as Error).message || 'Error al guardar');
    } finally {
      setUmLoading(false);
    }
  };

  const handleSaveAlmacen = async () => {
    if (!alForm.nombre.trim()) {
      setError('Nombre es requerido');
      return;
    }
    alForm.codigo = alForm.nombre;
    setAlLoading(true);
    try {
      const url =
        almacenMode === 'add'
          ? `${API}/almacen`
          : `${API}/almacen/${editAlmacenId}`;
      const method = almacenMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alForm),
      });
      if (!res.ok) throw new Error('Error al guardar');
      await loadAll();
      handleCloseAlmacenModal();
    } catch (e) {
      setError((e as Error).message || 'Error al guardar');
    } finally {
      setAlLoading(false);
    }
  };

  const handleDeleteUm = async (id: number) => {
    if (!window.confirm('¿Eliminar esta unidad de medida?')) return;
    try {
      await fetch(`${API}/unidades-medida/${id}`, { method: 'DELETE' });
      await loadAll();
    } catch {
      setError('Error al eliminar');
    }
  };

  const handleDeleteAlmacen = async (id: number) => {
    if (!window.confirm('¿Eliminar este almacén?')) return;
    try {
      await fetch(`${API}/almacen/${id}`, { method: 'DELETE' });
      await loadAll();
    } catch {
      setError('Error al eliminar');
    }
  };

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

      const movimientosSalida: MovimientoRepuesto[] = salidasHist.flatMap(
        (s) => {
          // La API puede devolver estos campos con distintos nombres según
          // el endpoint; los cubrimos todos acá en vez de castear a `any`.
          const sOt = s as {
            otNumero?: string | number;
            nroOt?: string | number;
            otId?: string | number;
            otNombre?: string;
            destino?: string;
            descripcionOt?: string;
          };
          return (s.detalles ?? [])
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
              // --- AQUÍ EXTRAEMOS LOS DATOS DE LA OT (Adapta los nombres si tu API usa otros) ---
              otNumero: sOt.otNumero || sOt.nroOt || sOt.otId || '',
              otNombre: sOt.otNombre || sOt.destino || sOt.descripcionOt || '',
            }));
        },
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
    ? (() => {
        const base = getMovimientosRepuesto(viewRepuesto.id);
        // include apertura as initial ingreso if present
        if (
          viewRepuesto.aperturaCantidad &&
          Number(viewRepuesto.aperturaCantidad) > 0
        ) {
          const apertura: MovimientoRepuesto = {
            tipo: 'COMPRA',
            fecha: viewRepuesto.createdAt as unknown as string,
            referencia: 'Apertura',
            codigo: getRepuestoCompositeId(viewRepuesto),
            nombre: viewRepuesto.nombre,
            cantidad: Number(viewRepuesto.aperturaCantidad) || 0,
            precioUnitario: Number(viewRepuesto.aperturaCostoUnitario) || 0,
            subtotal:
              (Number(viewRepuesto.aperturaCantidad) || 0) *
              (Number(viewRepuesto.aperturaCostoUnitario) || 0),
          };
          return [apertura, ...base].sort(
            (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
          );
        }
        return base;
      })()
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
            onClick={() =>
              exportRepuestosToExcel(
                repuestos,
                costCenters,
                processes,
                maquinas,
                subUnidades,
              )
            }
            style={{
              ...btnBase,
              backgroundColor: '#10B981',
              color: '#FFF',
            }}
          >
            📥 Exportar
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
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              <button
                onClick={() =>
                  exportCriticalStockToExcel(
                    repuestos,
                    costCenters,
                    processes,
                    maquinas,
                    subUnidades,
                  )
                }
                style={{
                  ...btnBase,
                  backgroundColor: '#10B981',
                  color: '#FFF',
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                }}
              >
                📋 Exportar
              </button>
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

      {/* Main vertical layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* ── TOP: preview / quick info ─────────────────────────────────── */}
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
              style={{ ...selectStyle, flex: 1 }}
              disabled={!ccId}
            >
              <option value="">-- Seleccionar --</option>
              {filteredProcesses.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {formatProcessName(p)}
                </option>
              ))}
            </select>
            <span style={badgeStyle}>
              {procId
                ? `${ccId}.${getProcessCorrelativo(Number(procId), processes)}`
                : '—'}
            </span>
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
                  {formatMaquinaName(m)}
                </option>
              ))}
            </select>
            <span style={badgeStyle}>
              {maqId
                ? `${ccId}.${getProcessCorrelativo(Number(procId), processes)}.${getMaquinaCorrelativo(Number(maqId), maquinas)}`
                : '—'}
            </span>
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
            <span style={badgeStyle}>{subId ? compositeId : '—'}</span>
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

        {/* ── BOTTOM: repuestos table ───────────────────────────────────────── */}
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
                  {[
                    'Almacén',
                    'Codigo',
                    'Nombre',
                    'Unidad',
                    'Ubicación',
                    'Stock',
                    'Costo U$',
                    'Costo Total',
                    'Acciones',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px 10px',
                        textAlign: h === 'Acciones' ? 'center' : 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && filteredRepuestos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{ textAlign: 'center', padding: 20 }}
                    >
                      Cargando...
                    </td>
                  </tr>
                ) : filteredRepuestos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
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
                            fontSize: 12,
                          }}
                        >
                          {r.almacen || '—'}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                            fontFamily: 'monospace',
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {r.tipo === 'LIBRE'
                            ? r.codigoPersonalizado || r.id
                            : getRepuestoCompositeId(r) || r.id}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                            minWidth: 180,
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {r.nombre}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                            fontSize: 13,
                          }}
                        >
                          {r.uMedida || '—'}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                            fontSize: 13,
                          }}
                        >
                          {r.ubicacion || '—'}
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
                          ${' '}
                          {Number(
                            r.costoUnitarioPonderado ?? r.costoUnitario,
                          ).toFixed(4)}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            borderBottom: `1px solid ${inputBorder}`,
                            fontWeight: 600,
                            color: isDark ? colors.gold : colors.brown,
                          }}
                        >
                          ${' '}
                          {(
                            Number(
                              r.costoUnitarioPonderado ?? r.costoUnitario,
                            ) * Number(r.cantidad)
                          ).toFixed(2)}
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

            {/* Tipo de Repuesto */}
            <div style={{ marginBottom: 16, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Tipo de Repuesto:</label>
              <select
                value={form.tipo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipo: e.target.value as 'NORMAL' | 'LIBRE',
                  })
                }
                style={selectStyle}
              >
                <option value="NORMAL">Normal</option>
                <option value="LIBRE">Libre</option>
              </select>
            </div>

            {form.tipo === 'LIBRE' && (
              /* Código Personalizado para Libre */
              <div style={{ marginBottom: 16, gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Código Personalizado:</label>
                <input
                  type="text"
                  value={form.codigoPersonalizado}
                  onChange={(e) =>
                    setForm({ ...form, codigoPersonalizado: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Ingrese código personalizado"
                />
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
                        {formatProcessName(p)}
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
                        {formatMaquinaName(m)}
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
                        {formatSubunidadName(s)}
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

                {/*  / Composite ID */}
                <div style={row}>
                  <span style={labelStyle}>ID compuesto</span>
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
                <div style={{ ...row, flex: 1 }}>
                  <span style={labelStyle}>U.Medida</span>
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    <select
                      name="uMedida"
                      value={form.uMedida}
                      onChange={handleFormChange}
                      style={{ ...selectStyle, flex: 1 }}
                    >
                      <option value="">-- Seleccionar --</option>
                      {unidadesMedida.map((um) => (
                        <option key={um.id} value={um.codigo}>
                          {um.codigo}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleOpenUmModal()}
                      style={{
                        ...btnBase,
                        backgroundColor: colors.gold,
                        color: colors.darkText,
                        padding: '5px 10px',
                      }}
                      title="Crear nueva unidad de medida"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* ALMACEN */}
                <div style={{ ...row, flex: 1 }}>
                  <span style={labelStyle}>Almacén</span>
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    <select
                      name="almacen"
                      value={form.almacen}
                      onChange={handleFormChange}
                      style={{ ...selectStyle, flex: 1 }}
                    >
                      <option value="">-- Seleccionar --</option>
                      {almacen.map((al) => (
                        <option key={al.id} value={al.nombre}>
                          {al.nombre}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleOpenAlmacenModal()}
                      style={{
                        ...btnBase,
                        backgroundColor: colors.gold,
                        color: colors.darkText,
                        padding: '5px 10px',
                      }}
                      title="Crear un nuevo almacén"
                    >
                      +
                    </button>
                  </div>
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

                {/* Precio (Ponderado) - editar aquí afectará el valor mostrado como precio actual */}
                <div style={row}>
                  <span style={labelStyle}>Precio (Ponderado)</span>
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() =>
                    exportRepuestoKardexToExcel(
                      viewRepuesto,
                      movimientosRepuesto,
                      costCenters,
                      processes,
                      maquinas,
                      subUnidades,
                    )
                  }
                  style={{
                    ...btnBase,
                    backgroundColor: '#10B981',
                    color: '#FFF',
                    padding: '6px 12px',
                    fontSize: 14,
                  }}
                >
                  📥 Exportar Kardex
                </button>
                <button
                  onClick={async () => {
                    if (!viewRepuesto) return;
                    setRecalculating(true);
                    try {
                      const response = await fetch(
                        `${API}/repuestos/${viewRepuesto.id}/recalcular`,
                        { method: 'POST' },
                      );
                      if (!response.ok) {
                        const body = await response.text();
                        throw new Error(body || 'Error al recalcular');
                      }
                      const updatedRepuesto = await response.json();
                      setViewRepuesto(updatedRepuesto);
                      setRepuestos((prev) =>
                        prev.map((r) =>
                          r.id === updatedRepuesto.id ? updatedRepuesto : r,
                        ),
                      );
                      alert('Recalculo completado');
                    } catch (error) {
                      console.error(error);
                      alert(
                        'No se pudo recalcular el repuesto. Revisa la consola para más detalles.',
                      );
                    } finally {
                      setRecalculating(false);
                    }
                  }}
                  disabled={recalculating}
                  style={{
                    ...btnBase,
                    backgroundColor: recalculating ? '#A3A3A3' : '#2563EB',
                    color: '#FFF',
                    padding: '6px 12px',
                    fontSize: 14,
                  }}
                >
                  {recalculating ? 'Recalculando...' : 'Recalcular'}
                </button>
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
                    'Precio (Ponderado) — usado en transacciones',
                    viewRepuesto.costoUnitarioPonderado != null
                      ? `$ ${Number(viewRepuesto.costoUnitarioPonderado).toFixed(4)}`
                      : viewRepuesto.costoUnitario != null
                        ? `$ ${Number(viewRepuesto.costoUnitario).toFixed(4)}`
                        : '—',
                  ],
                  [
                    'Costo original (referencia)',
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
                        'OT / Documento',
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

      {/* ═══ Unidad Medida Modal ═══════════════════════════════════════════ */}
      {showUnidadMedidaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => handleCloseUmModal()}
        >
          <div
            style={{
              backgroundColor: card,
              color: text,
              padding: 24,
              borderRadius: 8,
              width: '100%',
              maxWidth: 500,
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
                {unidadMedidaMode === 'add'
                  ? 'Nueva Unidad de Medida'
                  : 'Editar Unidad de Medida'}
              </h3>
              <button
                onClick={() => handleCloseUmModal()}
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

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={row}>
                <label style={labelStyle}>Nombre</label>
                <input
                  name="nombre"
                  value={umForm.nombre}
                  onChange={handleUmFormChange}
                  style={inputStyle}
                  placeholder="Ej: Pieza, Kilogramo, Litro"
                />
              </div>

              <div style={row}>
                <label style={labelStyle}>Código</label>
                <input
                  name="codigo"
                  value={umForm.codigo}
                  onChange={handleUmFormChange}
                  style={{ ...inputStyle, maxWidth: 120 }}
                  placeholder="Ej: PZA, KG, LT"
                  maxLength={10}
                />
              </div>

              <div style={row}>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  name="descripcion"
                  value={umForm.descripcion}
                  onChange={handleUmFormChange}
                  style={{
                    ...inputStyle,
                    minHeight: 60,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                  placeholder="Descripción opcional"
                />
              </div>
            </div>

            {/* Tabla de unidades actuales */}
            {unidadMedidaMode === 'add' && unidadesMedida.length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px',
                  backgroundColor: inputBg,
                  borderRadius: 4,
                  maxHeight: 150,
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: secondary,
                    marginBottom: 8,
                  }}
                >
                  Unidades Existentes:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {unidadesMedida.map((um) => (
                    <div
                      key={um.id}
                      style={{
                        backgroundColor: inputBorder,
                        padding: '4px 8px',
                        borderRadius: 3,
                        fontSize: 11,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <strong>{um.codigo}</strong>
                      <button
                        onClick={() => handleDeleteUm(um.id)}
                        style={{
                          ...btnBase,
                          backgroundColor: '#E53E3E',
                          color: '#FFF',
                          padding: '2px 6px',
                          fontSize: 10,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
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
                onClick={() => handleCloseUmModal()}
                disabled={umLoading}
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
                onClick={handleSaveUm}
                disabled={umLoading}
                style={{
                  ...btnBase,
                  backgroundColor: colors.brown,
                  color: '#FFF',
                  minWidth: 120,
                }}
              >
                {umLoading ? 'Guardando...' : 'Grabar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Almacen Modal ═══════════════════════════════════════════ */}
      {showAlmacenModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => handleCloseAlmacenModal()}
        >
          <div
            style={{
              backgroundColor: card,
              color: text,
              padding: 24,
              borderRadius: 8,
              width: '100%',
              maxWidth: 500,
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
                {almacenMode === 'add' ? 'Nuevo Almacén' : 'Editar Almacén'}
              </h3>
              <button
                onClick={() => handleCloseAlmacenModal()}
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

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={row}>
                <label style={labelStyle}>Nombre</label>
                <input
                  name="nombre"
                  value={alForm.nombre}
                  onChange={handleAlFormChange}
                  style={inputStyle}
                  placeholder="Ej: Alacen 1, Almacen a, etc."
                />
              </div>

              <div style={row}>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  name="descripcion"
                  value={alForm.descripcion}
                  onChange={handleAlFormChange}
                  style={{
                    ...inputStyle,
                    minHeight: 60,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                  placeholder="Descripción opcional"
                />
              </div>
            </div>

            {/* Tabla de almacenes actuales */}
            {almacenMode === 'add' && almacen.length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px',
                  backgroundColor: inputBg,
                  borderRadius: 4,
                  maxHeight: 150,
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: secondary,
                    marginBottom: 8,
                  }}
                >
                  Almacenes Existentes:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {almacen.map((al) => (
                    <div
                      key={al.id}
                      style={{
                        backgroundColor: inputBorder,
                        padding: '4px 8px',
                        borderRadius: 3,
                        fontSize: 11,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <strong>{al.nombre}</strong>
                      <button
                        onClick={() => handleDeleteAlmacen(al.id)}
                        style={{
                          ...btnBase,
                          backgroundColor: '#E53E3E',
                          color: '#FFF',
                          padding: '2px 6px',
                          fontSize: 10,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
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
                onClick={() => handleCloseAlmacenModal()}
                disabled={alLoading}
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
                onClick={handleSaveAlmacen}
                disabled={alLoading}
                style={{
                  ...btnBase,
                  backgroundColor: colors.brown,
                  color: '#FFF',
                  minWidth: 120,
                }}
              >
                {alLoading ? 'Guardando...' : 'Grabar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
