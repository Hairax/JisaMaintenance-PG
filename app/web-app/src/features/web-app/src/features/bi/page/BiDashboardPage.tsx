import React from 'react';
import { useBiData } from '../hooks/useBiData';
import BiSummaryCards from '../components/BiSummaryCards';
import BiBarChart from '../components/BiBarChart';
import BiLineChart from '../components/BiLineChart';
import BiPieChart from '../components/BiPieChart';

export const BiDashboardPage: React.FC = () => {
  const { data, loading, error } = useBiData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Total OTs',
      value: data.summary.totalOTs,
      color: 'blue' as const,
      icon: '📋',
    },
    {
      title: 'OTs Completadas',
      value: data.summary.completedOTs,
      color: 'green' as const,
      icon: '✅',
      trend: {
        value: 12,
        isPositive: true,
      },
    },
    {
      title: 'OTs Pendientes',
      value: data.summary.pendingOTs,
      color: 'yellow' as const,
      icon: '⏳',
    },
    {
      title: 'Tiempo Promedio (días)',
      value: data.summary.avgCompletionTime,
      color: 'purple' as const,
      icon: '⏱️',
      trend: {
        value: 8,
        isPositive: false,
      },
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard de Business Intelligence
        </h1>
        <p className="text-gray-600">
          Análisis y métricas de órdenes de trabajo
        </p>
      </div>

      <BiSummaryCards cards={summaryCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <BiBarChart
            data={data.otsByMonth}
            title="OTs por Mes"
            height={300}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <BiLineChart
            data={data.completionTrend}
            title="Tendencia de Finalización (%)"
            height={300}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <BiPieChart
            data={data.otsByDepartment}
            title="OTs por Departamento"
            height={300}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <BiPieChart
            data={data.otsByType}
            title="OTs por Tipo de Mantenimiento"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default BiDashboardPage;
