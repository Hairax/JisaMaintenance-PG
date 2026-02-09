import React, { useState } from 'react';
import * as XLSX from 'xlsx';

// Tipos para los datos
const userManagementColors = {
  bg: 'bg-[#F9FAFB]',
  card: 'bg-white',
  accent: 'bg-yellow-500',
  accentHover: 'hover:bg-yellow-600',
  textAccent: 'text-yellow-700',
  textTitle: 'text-[#2D3748]',
  border: 'border-gray-200',
  shadow: 'shadow-lg',
};

type Tecnico = { nombre: string; horas: number };
type Material = { nombre: string; cantidad: number };
type Mantenimiento = {
  id: number;
  codigoActivo: string;
  nombreActivo: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  responsable: string;
  costo: number;
  estado: string;
  tiempo: string;
  tecnicos: Tecnico[];
  materiales: Material[];
};

const mantenimientoData: Mantenimiento[] = [
  {
    id: 1,
    codigoActivo: '001',
    nombreActivo: 'Compresor de Aire',
    tipo: 'Preventivo',
    fecha: '2025-06-10',
    descripcion: 'Cambio de filtro y limpieza general',
    responsable: 'Carlos Rojas',
    costo: 180,
    estado: 'Cerrado',
    tiempo: '3h',
    tecnicos: [
      { nombre: 'Carlos Rojas', horas: 2 },
      { nombre: 'Luis Gómez', horas: 1 },
    ],
    materiales: [
      { nombre: 'Filtro de aire', cantidad: 1 },
      { nombre: 'Aceite lubricante', cantidad: 2 },
    ],
  },
  {
    id: 2,
    codigoActivo: '002',
    nombreActivo: 'Motor Eléctrico',
    tipo: 'Correctivo',
    fecha: '2025-06-15',
    descripcion: 'Reemplazo de bobinado dañado',
    responsable: 'María López',
    costo: 450,
    estado: 'Cerrado',
    tiempo: '5h',
    tecnicos: [
      { nombre: 'María López', horas: 3 },
      { nombre: 'Diego Ruiz', horas: 2 },
    ],
    materiales: [{ nombre: 'Bobina nueva', cantidad: 1 }],
  },
  {
    id: 3,
    codigoActivo: '003',
    nombreActivo: 'Bomba Centrífuga',
    tipo: 'Preventivo',
    fecha: '2025-06-20',
    descripcion: 'Medición de vibraciones y ajuste de alineación',
    responsable: 'Juan Pérez',
    costo: 220,
    estado: 'Abierto',
    tiempo: '2.5h',
    tecnicos: [{ nombre: 'Juan Pérez', horas: 2.5 }],
    materiales: [],
  },
  {
    id: 4,
    codigoActivo: '001',
    nombreActivo: 'Compresor de Aire',
    tipo: 'Correctivo',
    fecha: '2025-07-01',
    descripcion: 'Cambio de válvula defectuosa',
    responsable: 'Ana Quispe',
    costo: 310,
    estado: 'Cerrado',
    tiempo: '4h',
    tecnicos: [{ nombre: 'Ana Quispe', horas: 4 }],
    materiales: [{ nombre: 'Válvula', cantidad: 1 }],
  },
];

export default function MantenimientoPorActivoPage() {
  const [filtroActivo, setFiltroActivo] = useState('');
  const [detalleItem, setDetalleItem] = useState<Mantenimiento | null>(null);

  const dataFiltrada = mantenimientoData.filter((item) =>
    filtroActivo
      ? item.nombreActivo.toLowerCase().includes(filtroActivo.toLowerCase())
      : true,
  );

  const exportarExcel = () => {
    // Transformar los datos para el Excel
    const datosParaExportar = dataFiltrada.map((item) => ({
      'Código Activo': item.codigoActivo,
      'Nombre Activo': item.nombreActivo,
      Tipo: item.tipo,
      Fecha: item.fecha,
      Descripción: item.descripcion,
      Responsable: item.responsable,
      Costo: item.costo,
    }));

    // Crear hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);

    // Crear libro y añadir hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Mantenimiento por Activo');

    // Descargar archivo
    XLSX.writeFile(libro, 'reporte_mantenimiento_por_activo.xlsx');
  };

  return (
    <div className={`p-8 max-w-5xl mx-auto ${userManagementColors.bg}`}>
      <div
        className={`${userManagementColors.card} rounded-2xl ${userManagementColors.shadow} p-8`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${userManagementColors.textTitle}`}
        >
          Reporte de Mantenimiento por Activo
        </h2>
        <div className="flex gap-4 items-end mb-6">
          <input
            type="text"
            placeholder="Filtrar por nombre del activo"
            value={filtroActivo}
            onChange={(e) => setFiltroActivo(e.target.value)}
            className={`p-2 px-4 border ${userManagementColors.border} rounded-lg flex-1 focus:ring-2 focus:ring-yellow-400 bg-[#F7FAFC]`}
          />
          <button
            onClick={() => setFiltroActivo('')}
            className={`px-4 py-2 ${userManagementColors.accent} ${userManagementColors.accentHover} text-white rounded-lg font-medium shadow`}
          >
            Limpiar
          </button>
          <button
            onClick={exportarExcel}
            className={`px-4 py-2 ${userManagementColors.accent} ${userManagementColors.accentHover} text-white rounded-lg font-medium shadow`}
          >
            Exportar a Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-yellow-100">
                <th className="p-3 font-semibold text-[#6B7280]">
                  Código Activo
                </th>
                <th className="p-3 font-semibold text-[#6B7280]">Nombre</th>
                <th className="p-3 font-semibold text-[#6B7280]">Tipo</th>
                <th className="p-3 font-semibold text-[#6B7280]">Fecha</th>
                <th className="p-3 font-semibold text-[#6B7280]">
                  Descripción
                </th>
                <th className="p-3 font-semibold text-[#6B7280]">
                  Responsable
                </th>
                <th className="p-3 font-semibold text-[#6B7280]">Costo</th>
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-yellow-50 cursor-pointer border-b transition"
                  onClick={() => setDetalleItem(item)}
                >
                  <td className="p-3">{item.codigoActivo}</td>
                  <td className="p-3">{item.nombreActivo}</td>
                  <td className="p-3">{item.tipo}</td>
                  <td className="p-3">{item.fecha}</td>
                  <td className="p-3">{item.descripcion}</td>
                  <td className="p-3">{item.responsable}</td>
                  <td className="p-3 font-semibold text-yellow-700">
                    Bs {item.costo.toFixed(2)}
                  </td>
                </tr>
              ))}
              {dataFiltrada.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-yellow-900 p-6">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detalleItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`${userManagementColors.card} rounded-2xl ${userManagementColors.shadow} w-full max-w-xl p-8 relative border-t-8 border-yellow-500`}
          >
            <button
              onClick={() => setDetalleItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Cerrar"
            >
              &times;
            </button>
            <h3
              className={`text-xl font-bold mb-6 ${userManagementColors.textAccent}`}
            >
              Detalles de Mantenimiento
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="font-semibold text-[#6B7280]">Activo:</span>{' '}
                <span className="text-[#2D3748]">
                  {detalleItem.nombreActivo}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#6B7280]">Tipo:</span>{' '}
                <span className="text-[#2D3748]">{detalleItem.tipo}</span>
              </div>
              <div>
                <span className="font-semibold text-[#6B7280]">Fecha:</span>{' '}
                <span className="text-[#2D3748]">{detalleItem.fecha}</span>
              </div>
              <div>
                <span className="font-semibold text-[#6B7280]">
                  Responsable:
                </span>{' '}
                <span className="text-[#2D3748]">
                  {detalleItem.responsable}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#6B7280]">Estado:</span>{' '}
                <span className="text-[#2D3748]">{detalleItem.estado}</span>
              </div>
              <div>
                <span className="font-semibold text-[#6B7280]">
                  Tiempo Total:
                </span>{' '}
                <span className="text-[#2D3748]">{detalleItem.tiempo}</span>
              </div>
              <div>
                <span className="font-semibold text-[#6B7280]">Costo:</span>{' '}
                <span className="text-yellow-700 font-bold">
                  Bs {detalleItem.costo.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-semibold text-[#6B7280]">Técnicos:</span>
              <ul className="list-disc list-inside text-sm ml-4 mt-1">
                {detalleItem.tecnicos.length > 0 ? (
                  detalleItem.tecnicos.map((tec, i) => (
                    <li key={i} className="text-[#2D3748]">
                      <span className="font-medium text-yellow-700">
                        {tec.nombre}
                      </span>{' '}
                      <span className="text-gray-500">- {tec.horas}h</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400">Sin técnicos asignados</li>
                )}
              </ul>
            </div>
            <div className="mt-4">
              <span className="font-semibold text-[#6B7280]">
                Materiales Usados:
              </span>
              <ul className="list-disc list-inside text-sm ml-4 mt-1">
                {detalleItem.materiales.length > 0 ? (
                  detalleItem.materiales.map((mat, i) => (
                    <li key={i} className="text-[#2D3748]">
                      <span className="font-medium text-yellow-700">
                        {mat.nombre}
                      </span>{' '}
                      <span className="text-gray-500">- {mat.cantidad}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400">Sin materiales utilizados</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
