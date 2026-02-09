// Componente RankingTMEF
function RankingTMEF({ activos }: { activos: any[] }) {
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [sortAsc, setSortAsc] = React.useState(false);

  // Exportar ranking a Excel
  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    const data = sorted.map((row, i) => ({
      '#': i + 1,
      Activo: row.nombre,
      Fallas: row.fallas,
      'TMEF (días)': row.tmef !== null ? row.tmef.toFixed(2) : 'No calculable',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ranking TMEF');
    XLSX.writeFile(
      wb,
      `ranking_tmef_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // Calcular TMEF para cada activo en el rango
  const ranking = React.useMemo(() => {
    return activos.map((activo) => {
      const otsValidas = activo.ordenesTrabajo.filter((ot) => {
        if (
          ot.tipo !== 'correctivo' ||
          ot.estado !== 'cerrada' ||
          !ot.tipoFalla
        )
          return false;
        const fecha = new Date(ot.fechaInicio);
        const afterStart = !from || fecha >= new Date(from);
        const beforeEnd = !to || fecha <= new Date(to);
        return afterStart && beforeEnd;
      });
      if (otsValidas.length < 2) {
        return {
          nombre: activo.nombre,
          tmef: null,
          fallas: otsValidas.length,
        };
      }
      const fechas = otsValidas
        .map((ot) => new Date(ot.fechaInicio))
        .sort((a, b) => a.getTime() - b.getTime());
      let totalIntervalo = 0;
      for (let i = 1; i < fechas.length; i++) {
        const diffDias =
          (fechas[i].getTime() - fechas[i - 1].getTime()) /
          (1000 * 60 * 60 * 24);
        totalIntervalo += diffDias;
      }
      const tmef = totalIntervalo / (fechas.length - 1);
      return {
        nombre: activo.nombre,
        tmef,
        fallas: otsValidas.length,
      };
    });
  }, [activos, from, to]);

  // Ordenar
  const sorted = React.useMemo(() => {
    return [...ranking].sort((a, b) =>
      sortAsc
        ? (a.tmef ?? -1) - (b.tmef ?? -1)
        : (b.tmef ?? -1) - (a.tmef ?? -1),
    );
  }, [ranking, sortAsc]);

  return (
    <div className="mt-10 bg-white p-4 rounded-xl shadow">
      <div className="flex justify-end mb-2">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold shadow"
          onClick={exportToExcel}
        >
          Exportar Ranking a Excel
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <span className="font-semibold text-gray-700">
          Ranking TMEF por Activo
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
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Activo</th>
              <th className="border p-2 text-center">Fallas</th>
              <th className="border p-2 text-center">
                <button
                  className="font-bold text-blue-600 hover:underline"
                  onClick={() => setSortAsc((v) => !v)}
                  title="Ordenar por TMEF"
                >
                  TMEF (días) {sortAsc ? '▲' : '▼'}
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
                <td className="border p-2 text-center">{row.fallas}</td>
                <td className="border p-2 text-center">
                  {row.tmef !== null ? row.tmef.toFixed(2) : 'No calculable'}
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
  /* Ranking TMEF */
}
// TMEFPage.tsx
import React, { useState, useMemo } from 'react';
import { activos } from './mockDataTMEF';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

export default function TMEFPage() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [activoSeleccionado, setActivoSeleccionado] = useState('');

  const tmefData = useMemo(() => {
    return activos
      .filter(
        (a) => !activoSeleccionado || a.id.toString() === activoSeleccionado,
      )
      .map((activo) => {
        const otsValidas = activo.ordenesTrabajo.filter((ot) => {
          if (
            ot.tipo !== 'correctivo' ||
            ot.estado !== 'cerrada' ||
            !ot.tipoFalla
          )
            return false;

          const fecha = new Date(ot.fechaInicio);
          const afterStart = !fechaInicio || fecha >= new Date(fechaInicio);
          const beforeEnd = !fechaFin || fecha <= new Date(fechaFin);

          return afterStart && beforeEnd;
        });

        if (otsValidas.length < 2) {
          return {
            activo: activo.nombre,
            tmef: null,
            fallas: otsValidas.length,
            ultimaFalla: otsValidas.at(-1)?.fechaInicio || null,
            tiposFalla: [],
            fallasDetalle: otsValidas,
          };
        }

        const fechas = otsValidas
          .map((ot) => new Date(ot.fechaInicio))
          .sort((a, b) => a.getTime() - b.getTime());

        let totalIntervalo = 0;
        for (let i = 1; i < fechas.length; i++) {
          const diffDias =
            (fechas[i].getTime() - fechas[i - 1].getTime()) /
            (1000 * 60 * 60 * 24);
          totalIntervalo += diffDias;
        }

        const tmef = totalIntervalo / (fechas.length - 1);

        const tiposFallaCount = otsValidas.reduce((acc, ot) => {
          acc[ot.tipoFalla] = (acc[ot.tipoFalla] || 0) + 1;
          return acc;
        }, {});

        return {
          activo: activo.nombre,
          tmef,
          fallas: otsValidas.length,
          ultimaFalla: otsValidas.at(-1)?.fechaInicio || null,
          tiposFalla: Object.entries(tiposFallaCount).map(
            ([tipo, count]) => `${tipo} (${count})`,
          ),
          fallasDetalle: otsValidas,
        };
      });
  }, [fechaInicio, fechaFin, activoSeleccionado]);

  // Datos para Heatmap
  const heatmapData = useMemo(() => {
    let data: any[] = [];
    tmefData.forEach((item) => {
      item.fallasDetalle.forEach((ot) => {
        data.push({
          activo: item.activo,
          fecha: new Date(ot.fechaInicio).getTime(),
          tipoFalla: ot.tipoFalla,
          intensidad: 1,
        });
      });
    });
    return data;
  }, [tmefData]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        KPI: Tiempo Medio Entre Fallas (TMEF)
      </h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-xl shadow">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Activo
          </label>
          <select
            value={activoSeleccionado}
            onChange={(e) => setActivoSeleccionado(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Todos</option>
            {activos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Fecha Fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-2 text-left">Activo</th>
              <th className="border p-2 text-center">Fallas</th>
              <th className="border p-2 text-center">TMEF (días)</th>
              <th className="border p-2 text-center">Última Falla</th>
              <th className="border p-2 text-left">Tipos de Falla</th>
            </tr>
          </thead>
          <tbody>
            {tmefData.map((item, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 transition-colors text-gray-800"
              >
                <td className="border p-2">{item.activo}</td>
                <td className="border p-2 text-center">{item.fallas}</td>
                <td className="border p-2 text-center">
                  {item.tmef !== null ? item.tmef.toFixed(2) : 'No calculable'}
                </td>
                <td className="border p-2 text-center">
                  {item.ultimaFalla
                    ? new Date(item.ultimaFalla).toLocaleDateString()
                    : '-'}
                </td>
                <td className="border p-2">
                  {item.tiposFalla.length > 0
                    ? item.tiposFalla.join(', ')
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfico Barras */}
      <div className="mt-8 bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Gráfico TMEF por Activo
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tmefData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="activo" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tmef" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div className="mt-8 bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Historial de Fallas (Heatmap)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="fecha"
              domain={['auto', 'auto']}
              tickFormatter={(unixTime) =>
                new Date(unixTime).toLocaleDateString()
              }
              name="Fecha"
            />
            <YAxis type="category" dataKey="tipoFalla" name="Tipo de Falla" />
            <ZAxis type="number" dataKey="intensidad" range={[50, 200]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name, props) => {
                if (name === 'fecha') {
                  return new Date(value as number).toLocaleDateString();
                }
                return value;
              }}
            />
            <Scatter data={heatmapData} fill="#ef4444" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <RankingTMEF activos={activos} />
    </div>
  );
}
