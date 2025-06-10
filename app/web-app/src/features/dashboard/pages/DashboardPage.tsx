import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import {
  Gauge,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  HeatMapChart,
} from 'recharts';
import { colors } from '../../../shared/types/colors'; // Usa tu paleta centralizada

const mockKPIs = {
  DISP: 92.5,
  TMEF: 120,
  TMPR: 35,
  costoPorActivo: [
    { name: 'Compresor', costo: 1200 },
    { name: 'Bomba', costo: 950 },
    { name: 'Motor', costo: 2100 },
    { name: 'Generador', costo: 1800 },
    { name: 'Ventilador', costo: 400 },
  ],
};

const mockDisponibilidad = [
  { fecha: '2024-05-01', DISP: 95 },
  { fecha: '2024-05-02', DISP: 93 },
  { fecha: '2024-05-03', DISP: 92 },
  { fecha: '2024-05-04', DISP: 94 },
  { fecha: '2024-05-05', DISP: 90 },
  { fecha: '2024-05-06', DISP: 92 },
];

const mockTMEF = [
  { activo: 'Compresor', TMEF: 80 },
  { activo: 'Bomba', TMEF: 150 },
  { activo: 'Motor', TMEF: 60 },
  { activo: 'Generador', TMEF: 200 },
  { activo: 'Ventilador', TMEF: 300 },
];

const mockTMPR = [
  { tecnico: 'Juan', TMPR: 30 },
  { tecnico: 'Ana', TMPR: 40 },
  { tecnico: 'Luis', TMPR: 25 },
  { tecnico: 'Pedro', TMPR: 50 },
];

const mockPareto = [
  { name: 'Motor', value: 2100 },
  { name: 'Generador', value: 1800 },
  { name: 'Compresor', value: 1200 },
  { name: 'Bomba', value: 950 },
  { name: 'Ventilador', value: 400 },
];

const mockHeatmap = [
  { dia: 'Lunes', hora: '08:00', fallas: 2 },
  { dia: 'Lunes', hora: '12:00', fallas: 5 },
  { dia: 'Martes', hora: '08:00', fallas: 1 },
  { dia: 'Martes', hora: '12:00', fallas: 3 },
  { dia: 'Miércoles', hora: '08:00', fallas: 4 },
  { dia: 'Miércoles', hora: '12:00', fallas: 2 },
];

const mockComparativa = [
  { periodo: 'Abril', DISP: 90, TMEF: 110, TMPR: 40 },
  { periodo: 'Mayo', DISP: 92.5, TMEF: 120, TMPR: 35 },
];

const mockReportes = [
  { reporte: 'Kardex Valorado', objetivo: 'Control contable del stock' },
  {
    reporte: 'Costos por tipo de mantenimiento',
    objetivo: 'Análisis de gasto por categoría',
  },
  { reporte: 'Costo total por OT', objetivo: 'Saber dónde se gasta más' },
  {
    reporte: 'Registro de compras',
    objetivo: 'Auditoría y control presupuestario',
  },
  {
    reporte: 'Consumo por periodo',
    objetivo: 'Detectar insumos sobreutilizados',
  },
  {
    reporte: 'Toma física de inventario',
    objetivo: 'Reconciliar stock real vs teórico',
  },
  {
    reporte: 'Mantenimiento por activo',
    objetivo: 'Ver historial y evaluar reemplazos',
  },
];

const PIE_COLORS = [
  colors.gold,
  colors.brown,
  colors.beige,
  '#2563eb', // azul fuerte extra para contraste
  '#10b981', // verde extra para contraste
];

export const DashboardPage = () => {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Colores para gráficos según tema
  const gridColor = isDarkMode ? '#444' : '#B0B0B0';
  const axisColor = isDarkMode ? colors.lightText : colors.darkText;
  const tooltipBg = isDarkMode ? colors.darkBg : '#fff';
  const tooltipText = isDarkMode ? colors.lightText : colors.darkText;

  // Colores de líneas y barras según tema
  const lineDispColor = isDarkMode ? colors.gold : colors.brown;
  const barTMEFColor = isDarkMode ? colors.brown : '#2563eb';
  const lineTMPRColor = isDarkMode ? '#2563eb' : colors.brown;
  const barCostosColor = isDarkMode ? colors.gold : '#2563eb';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1
          className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
        >
          BI - Dashboard Operativo
        </h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow flex flex-col items-center">
          <span className="text-sm text-gray-500">DISP (%)</span>
          <span className="text-3xl font-bold">{mockKPIs.DISP}%</span>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow flex flex-col items-center">
          <span className="text-sm text-gray-500">TMEF (min)</span>
          <span className="text-3xl font-bold">{mockKPIs.TMEF}</span>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow flex flex-col items-center">
          <span className="text-sm text-gray-500">TMPR (min)</span>
          <span className="text-3xl font-bold">{mockKPIs.TMPR}</span>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow flex flex-col items-center">
          <span className="text-sm text-gray-500">Activos Analizados</span>
          <span className="text-3xl font-bold">
            {mockKPIs.costoPorActivo.length}
          </span>
        </div>
      </div>

      {/* DISPONIBILIDAD */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-2">
          Disponibilidad (DISP) - Últimos días
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={mockDisponibilidad}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="fecha" stroke={axisColor} />
            <YAxis domain={[80, 100]} stroke={axisColor} />
            <Tooltip
              contentStyle={{ background: tooltipBg, color: tooltipText }}
            />
            <Line
              type="monotone"
              dataKey="DISP"
              stroke={lineDispColor}
              strokeWidth={3}
              dot={{ r: 5, fill: lineDispColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TMEF */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-2">Tiempo Medio Entre Fallas (TMEF)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockTMEF}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="activo" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip
              contentStyle={{ background: tooltipBg, color: tooltipText }}
            />
            <Bar dataKey="TMEF" fill={barTMEFColor} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TMPR */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-2">
          Tiempo Medio de Reparación (TMPR) por Técnico
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={mockTMPR}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="tecnico" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip
              contentStyle={{ background: tooltipBg, color: tooltipText }}
            />
            <Line
              type="monotone"
              dataKey="TMPR"
              stroke={lineTMPRColor}
              strokeWidth={3}
              dot={{ r: 5, fill: lineTMPRColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Costos por Activo */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-2">
          Costos de Mantenimiento por Activo
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockKPIs.costoPorActivo}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip
              contentStyle={{ background: tooltipBg, color: tooltipText }}
            />
            <Bar dataKey="costo" fill={barCostosColor} />
          </BarChart>
        </ResponsiveContainer>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Activo</th>
                <th className="p-2 text-left">Costo (Bs)</th>
              </tr>
            </thead>
            <tbody>
              {mockKPIs.costoPorActivo.map((row) => (
                <tr key={row.name}>
                  <td className="p-2">{row.name}</td>
                  <td className="p-2">{row.costo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pareto */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-2">Pareto de Costos (80/20)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={mockPareto}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {mockPareto.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={PIE_COLORS[idx % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: tooltipBg, color: tooltipText }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Comparativa entre periodos */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-2">Comparativa de KPIs por Periodo</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={mockComparativa}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="periodo" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip
              contentStyle={{ background: tooltipBg, color: tooltipText }}
            />
            <Line type="monotone" dataKey="DISP" stroke={lineDispColor} />
            <Line type="monotone" dataKey="TMEF" stroke={barTMEFColor} />
            <Line type="monotone" dataKey="TMPR" stroke={lineTMPRColor} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Reportes Estratégicos / Operativos */}
      {/*<div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-2">
          Reportes Estratégicos / Operativos
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Reporte</th>
                <th className="p-2 text-left">Objetivo</th>
              </tr>
            </thead>
            <tbody>
              {mockReportes.map((row) => (
                <tr key={row.reporte}>
                  <td className="p-2">{row.reporte}</td>
                  <td className="p-2">{row.objetivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>*}

      {/* Heatmap de fallas (simulado con tabla) */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-2">
          Heatmap de Fallas (Patrones Temporales)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Día</th>
                <th className="p-2 text-left">Hora</th>
                <th className="p-2 text-left">Fallas</th>
              </tr>
            </thead>
            <tbody>
              {mockHeatmap.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2">{row.dia}</td>
                  <td className="p-2">{row.hora}</td>
                  <td className="p-2">{row.fallas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
