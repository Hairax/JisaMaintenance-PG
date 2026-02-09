import React, { useState } from 'react';
//import BiBarChart from '../components/BiBarChart';
// import BiLineChart from '../components/BiLineChart';
// import BiPieChart from '../components/BiPieChart';
// If the file exists elsewhere, update the path accordingly, e.g.:
// import BiPieChart from '../../common/components/BiPieChart';

interface OTDetail {
  id: number;
  fecha: string;
  tipo: string;
  estado: string;
  responsable: string;
  duracion: number;
  materiales: string[];
}

interface BiDataPoint {
  name: string;
  value: number;
}

const activos = ['Generador A', 'Compresor B', 'Motor C', 'Ventilador D'];

const mockData: Record<
  string,
  {
    resumen: BiDataPoint[];
    lineaTiempo: BiDataPoint[];
    porTipo: BiDataPoint[];
    porDepartamento: BiDataPoint[];
    detalleOTs: OTDetail[];
  }
> = {
  'Generador A': {
    resumen: [
      { name: 'OTs Totales', value: 120 },
      { name: 'OTs Completadas', value: 95 },
      { name: 'OTs Pendientes', value: 25 },
      { name: 'Tiempo Prom. (días)', value: 3.4 },
    ],
    lineaTiempo: [
      { name: '01/07', value: 1 },
      { name: '08/07', value: 1 },
      { name: '16/07', value: 1 },
      { name: '22/07', value: 1 },
    ],
    porTipo: [
      { name: 'Correctivo', value: 45 },
      { name: 'Preventivo', value: 60 },
      { name: 'Predictivo', value: 15 },
    ],
    porDepartamento: [
      { name: 'Mantenimiento', value: 70 },
      { name: 'Producción', value: 30 },
      { name: 'Calidad', value: 20 },
    ],
    detalleOTs: [
      {
        id: 101,
        fecha: '2025-07-01',
        tipo: 'Correctivo',
        estado: 'Cerrado',
        responsable: 'Carlos López',
        duracion: 4,
        materiales: ['Filtro de aire', 'Aceite 10W40'],
      },
      {
        id: 102,
        fecha: '2025-07-08',
        tipo: 'Preventivo',
        estado: 'Cerrado',
        responsable: 'Ana Pérez',
        duracion: 3,
        materiales: ['Correa', 'Tornillos M8'],
      },
      {
        id: 103,
        fecha: '2025-07-16',
        tipo: 'Correctivo',
        estado: 'Abierto',
        responsable: 'Luis Gómez',
        duracion: 2,
        materiales: ['Lubricante'],
      },
      {
        id: 104,
        fecha: '2025-07-22',
        tipo: 'Preventivo',
        estado: 'Cerrado',
        responsable: 'María Vargas',
        duracion: 5,
        materiales: ['Filtro hidráulico', 'Sensor de presión'],
      },
    ],
  },
};

const BiDashboardPage = () => {
  const [activoSeleccionado, setActivoSeleccionado] = useState('Generador A');
  const [modalOT, setModalOT] = useState<OTDetail | null>(null);

  const datos = mockData[activoSeleccionado];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Dashboard BI por Activo
      </h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Activo</label>
          <select
            className="w-full p-2 border rounded"
            value={activoSeleccionado}
            onChange={(e) => setActivoSeleccionado(e.target.value)}
          >
            {activos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Fecha Inicial
          </label>
          <input type="date" className="w-full p-2 border rounded" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Fecha Final</label>
          <input type="date" className="w-full p-2 border rounded" />
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {datos.resumen.map((card) => (
          <div
            key={card.name}
            className="bg-white p-4 rounded shadow text-center border"
          >
            <h2 className="text-lg font-semibold">{card.name}</h2>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow border">
          <BiBarChart data={datos.porTipo} title="OTs por Tipo" />
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <BiPieChart
            data={datos.porDepartamento}
            title="OTs por Departamento"
          />
        </div>
      </div>

      {/* Línea de tiempo con modal */}
      <div className="bg-white p-4 rounded shadow border mb-6">
        <h3 className="text-xl font-semibold mb-2">Línea de Tiempo de OTs</h3>
        <BiLineChart
          data={datos.lineaTiempo}
          title=""
          height={300}
          onClick={(index) => setModalOT(datos.detalleOTs[index])}
        />
      </div>

      {/* Modal OT Detallado */}
      {modalOT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <button
              onClick={() => setModalOT(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">
              Detalle de OT #{modalOT.id}
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Fecha:</strong> {modalOT.fecha}
              </li>
              <li>
                <strong>Tipo:</strong> {modalOT.tipo}
              </li>
              <li>
                <strong>Estado:</strong> {modalOT.estado}
              </li>
              <li>
                <strong>Responsable:</strong> {modalOT.responsable}
              </li>
              <li>
                <strong>Duración:</strong> {modalOT.duracion} horas
              </li>
              <li>
                <strong>Materiales:</strong>
                <ul className="ml-4 list-disc">
                  {modalOT.materiales.map((mat, i) => (
                    <li key={i}>{mat}</li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiDashboardPage;
