import * as XLSX from 'xlsx';
function RankingCostos({ costosPorActivo, modo }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  // Calcular costos filtrados por rango
  const ranking = useMemo(() => {
    return costosPorActivo.map((activo) => {
      const ordenesFiltradas = activo.ordenes.filter((ot) => {
        const fechaOT = new Date(ot.fecha);
        return (
          (!from || fechaOT >= new Date(from)) &&
          (!to || fechaOT <= new Date(to))
        );
      });
      const costoTotal = ordenesFiltradas.reduce(
        (acc, ot) => acc + ot.costo,
        0,
      );
      const costoPromedio =
        ordenesFiltradas.length > 0 ? costoTotal / ordenesFiltradas.length : 0;
      return {
        id: activo.id,
        nombre: activo.nombre,
        tipo: activo.tipo,
        cantidad: ordenesFiltradas.length,
        costo: modo === 'total' ? costoTotal : costoPromedio,
      };
    });
  }, [costosPorActivo, from, to, modo]);

  // Ordenar
  const sorted = useMemo(() => {
    return [...ranking].sort((a, b) =>
      sortAsc ? a.costo - b.costo : b.costo - a.costo,
    );
  }, [ranking, sortAsc]);

  // Exportar a Excel
  const exportToExcel = () => {
    const data = sorted.map((row, i) => ({
      '#': i + 1,
      Activo: row.nombre,
      Tipo: row.tipo,
      '# OTs': row.cantidad,
      [modo === 'total' ? 'Costo Total' : 'Costo Promedio']: row.costo,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ranking');
    XLSX.writeFile(workbook, 'ranking_costos.xlsx');
  };
  return (
    <div className="mt-10 bg-white p-4 rounded-xl shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <span className="font-semibold text-gray-700">
          Ranking de Costos por Activo
        </span>
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
        >
          Exportar a Excel
        </button>
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
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Activo</th>
              <th className="border p-2 text-left">Tipo</th>
              <th className="border p-2 text-center"># OTs</th>
              <th className="border p-2 text-center">
                <button
                  className="font-bold text-blue-600 hover:underline"
                  onClick={() => setSortAsc((v) => !v)}
                  title="Ordenar por costo"
                >
                  {modo === 'total' ? 'Costo Total' : 'Costo Promedio'}{' '}
                  {sortAsc ? '▲' : '▼'}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition-colors text-gray-800"
              >
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{row.nombre}</td>
                <td className="border p-2">{row.tipo}</td>
                <td className="border p-2 text-center">{row.cantidad}</td>
                <td className="border p-2 text-center">
                  ${row.costo.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
{
  /* Ranking de costos */
}
// pages/KPICostoPorActivo.tsx
import React, { useState, useMemo } from 'react';
import { costosPorActivo } from './costosPorActivo';

export default function KPICostoPorActivo() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [modo, setModo] = useState<'total' | 'promedio'>('total');

  const datosFiltrados = useMemo(() => {
    return costosPorActivo.map((activo) => {
      const ordenesFiltradas = activo.ordenes.filter((ot) => {
        const fechaOT = new Date(ot.fecha);
        return (
          (!fechaInicio || fechaOT >= new Date(fechaInicio)) &&
          (!fechaFin || fechaOT <= new Date(fechaFin))
        );
      });
      const costoTotal = ordenesFiltradas.reduce(
        (acc, ot) => acc + ot.costo,
        0,
      );
      const costoPromedio =
        ordenesFiltradas.length > 0 ? costoTotal / ordenesFiltradas.length : 0;
      return {
        ...activo,
        ordenes: ordenesFiltradas,
        costoTotal,
        costoPromedio,
      };
    });
  }, [fechaInicio, fechaFin]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">KPI - Costo por Activo</h1>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm">Fecha inicio</label>
          <input
            type="date"
            className="border p-1 rounded"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Fecha fin</label>
          <input
            type="date"
            className="border p-1 rounded"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Modo</label>
          <select
            className="border p-1 rounded"
            value={modo}
            onChange={(e) => setModo(e.target.value as 'total' | 'promedio')}
          >
            <option value="total">Costo total</option>
            <option value="promedio">Costo promedio</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <table className="w-full border border-gray-300 rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Activo</th>
            <th className="border p-2">Tipo</th>
            <th className="border p-2"># OTs</th>
            <th className="border p-2">
              {modo === 'total' ? 'Costo Total' : 'Costo Promedio'}
            </th>
          </tr>
        </thead>
        <tbody>
          {datosFiltrados.map((activo) => (
            <tr key={activo.id} className="text-center">
              <td className="border p-2">{activo.nombre}</td>
              <td className="border p-2">{activo.tipo}</td>
              <td className="border p-2">{activo.ordenes.length}</td>
              <td className="border p-2">
                {modo === 'total'
                  ? `$${activo.costoTotal}`
                  : `$${activo.costoPromedio.toFixed(2)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Gráfico */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Gráfico de costos</h2>
        <div className="flex items-end gap-4 mt-4">
          {datosFiltrados.map((activo) => {
            const valor =
              modo === 'total' ? activo.costoTotal : activo.costoPromedio;
            return (
              <div key={activo.id} className="flex flex-col items-center">
                <div
                  className="bg-blue-500 w-10 rounded-t"
                  style={{
                    height: `${valor / 10}px`, // escala simple
                  }}
                  title={`${activo.nombre}: $${valor}`}
                ></div>
                <span className="text-xs mt-1">{activo.nombre}</span>
              </div>
            );
          })}
        </div>
      </div>

      <RankingCostos costosPorActivo={costosPorActivo} modo={modo} />
    </div>
  );
}
