function RankingTMPR({ activos, ordenesTrabajo }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  // Calcular TMPR para cada activo en el rango
  const ranking = useMemo(() => {
    return activos.map((activo) => {
      const ots = ordenesTrabajo.filter(
        (ot) =>
          ot.tipo === 'Correctivo' &&
          ot.estado === 'Cerrada' &&
          ot.activoId === activo.id &&
          (!from || new Date(ot.fechaInicio) >= new Date(from)) &&
          (!to || new Date(ot.fechaFin) <= new Date(to)),
      );
      if (ots.length === 0) {
        return {
          nombre: activo.nombre,
          tmpr: null,
          reparaciones: 0,
        };
      }
      const totalHoras = ots.reduce((sum, ot) => {
        const inicio = new Date(ot.fechaInicio);
        const fin = new Date(ot.fechaFin);
        return sum + (fin - inicio) / (1000 * 60 * 60);
      }, 0);
      const tmpr = totalHoras / ots.length;
      return {
        nombre: activo.nombre,
        tmpr,
        reparaciones: ots.length,
      };
    });
  }, [activos, ordenesTrabajo, from, to]);

  // Ordenar
  const sorted = useMemo(() => {
    return [...ranking].sort((a, b) =>
      sortAsc
        ? (a.tmpr ?? -1) - (b.tmpr ?? -1)
        : (b.tmpr ?? -1) - (a.tmpr ?? -1),
    );
  }, [ranking, sortAsc]);

  // Exportar ranking a Excel
  const exportToExcel = () => {
    const wsData = [
      ['#', 'Activo', 'Reparaciones', 'TMPR (h)'],
      ...sorted.map((row, i) => [
        i + 1,
        row.nombre,
        row.reparaciones,
        row.tmpr !== null ? row.tmpr.toFixed(2) : 'No calculable',
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ranking TMPR');
    XLSX.writeFile(wb, 'ranking_tmpr.xlsx');
  };

  return (
    <div className="mt-10 bg-white p-4 rounded-xl shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <span className="font-semibold text-gray-700">
          Ranking TMPR por Activo
        </span>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <label className="text-sm text-gray-600">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <button
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition ml-2"
          onClick={exportToExcel}
        >
          Exportar a Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Activo</th>
              <th className="border p-2 text-center">Reparaciones</th>
              <th className="border p-2 text-center">
                <button
                  className="font-bold text-blue-600 hover:underline"
                  onClick={() => setSortAsc((v) => !v)}
                  title="Ordenar por TMPR"
                >
                  TMPR (h) {sortAsc ? '▲' : '▼'}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.nombre}
                className="hover:bg-gray-50 transition-colors text-gray-800"
              >
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{row.nombre}</td>
                <td className="border p-2 text-center">{row.reparaciones}</td>
                <td className="border p-2 text-center">
                  {row.tmpr !== null ? row.tmpr.toFixed(2) : 'No calculable'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// TMPRPage.jsx
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { activos, ordenesTrabajo } from './mockDB_TMPR';

export default function TMPRPage() {
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);

  // Filtrar OT correctivas cerradas
  const otsFiltradas = useMemo(() => {
    return ordenesTrabajo.filter(
      (ot) =>
        ot.tipo === 'Correctivo' &&
        ot.estado === 'Cerrada' &&
        (!activoSeleccionado || ot.activoId === parseInt(activoSeleccionado)),
    );
  }, [activoSeleccionado]);

  // Calcular tiempos de reparación
  const datosConDuracion = otsFiltradas.map((ot) => {
    const inicio = new Date(ot.fechaInicio);
    const fin = new Date(ot.fechaFin);
    const horas = (fin - inicio) / (1000 * 60 * 60);
    return { ...ot, horas };
  });

  const tmpr = useMemo(() => {
    if (datosConDuracion.length === 0) return 0;
    const totalHoras = datosConDuracion.reduce((sum, ot) => sum + ot.horas, 0);
    return (totalHoras / datosConDuracion.length).toFixed(2);
  }, [datosConDuracion]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        ⏱ TMPR - Tiempo Medio para Reparar
      </h1>

      {/* Filtro por activo */}
      <div className="flex gap-4 items-center">
        <label className="font-semibold">Seleccionar activo:</label>
        <select
          className="border rounded px-2 py-1"
          onChange={(e) => setActivoSeleccionado(e.target.value)}
        >
          <option value="">Todos</option>
          {activos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* KPI principal */}
      <div className="bg-blue-100 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold">Tiempo Medio para Reparar</h2>
        <p className="text-4xl font-bold text-blue-700">{tmpr} h</p>
      </div>

      {/* Gráfico de barras */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Duración de cada reparación
        </h3>
        <div className="flex items-end gap-2 h-40">
          {datosConDuracion.map((ot) => (
            <div key={ot.id} className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-8 rounded-t"
                style={{ height: `${ot.horas * 20}px` }}
              ></div>
              <span className="text-xs mt-1">OT-{ot.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla detallada */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">OT</th>
            <th className="border p-2">Activo</th>
            <th className="border p-2">Fecha Inicio</th>
            <th className="border p-2">Fecha Fin</th>
            <th className="border p-2">Duración (h)</th>
            <th className="border p-2">Técnicos</th>
          </tr>
        </thead>
        <tbody>
          {datosConDuracion.map((ot) => (
            <tr key={ot.id}>
              <td className="border p-2">OT-{ot.id}</td>
              <td className="border p-2">
                {activos.find((a) => a.id === ot.activoId)?.nombre}
              </td>
              <td className="border p-2">{ot.fechaInicio}</td>
              <td className="border p-2">{ot.fechaFin}</td>
              <td className="border p-2">{ot.horas.toFixed(2)}</td>
              <td className="border p-2">{ot.tecnicos.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <RankingTMPR activos={activos} ordenesTrabajo={ordenesTrabajo} />
    </div>
  );
}
