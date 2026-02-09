import { useState, useEffect } from 'react';

export interface BiDataPoint {
  name: string;
  value: number;
}

export interface BiData {
  summary: {
    totalOTs: number;
    completedOTs: number;
    pendingOTs: number;
    avgCompletionTime: number; // en días
    mttr: number; // en horas
    mtbf: number; // en días
    totalCost: number; // en Bs
  };
  otsByMonth: BiDataPoint[];
  otsByDepartment: BiDataPoint[];
  otsByType: BiDataPoint[];
  completionTrend: BiDataPoint[];
  costByMonth: BiDataPoint[];
  mttrTrend: BiDataPoint[];
  otRatioPreventiveVsCorrective: BiDataPoint[];
}

export const useBiData = () => {
  const [data, setData] = useState<BiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBiData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulación de datos
        const mockData: BiData = {
          summary: {
            totalOTs: 1250,
            completedOTs: 980,
            pendingOTs: 270,
            avgCompletionTime: 4.2, // días
            mttr: 3.1, // horas
            mtbf: 15.4, // días
            totalCost: 84500, // Bs
          },
          otsByMonth: [
            { name: 'Ene', value: 120 },
            { name: 'Feb', value: 98 },
            { name: 'Mar', value: 135 },
            { name: 'Abr', value: 110 },
            { name: 'May', value: 145 },
            { name: 'Jun', value: 160 },
          ],
          otsByDepartment: [
            { name: 'Producción', value: 450 },
            { name: 'Mantenimiento', value: 320 },
            { name: 'Calidad', value: 280 },
            { name: 'Logística', value: 200 },
          ],
          otsByType: [
            { name: 'Preventivo', value: 620 },
            { name: 'Correctivo', value: 430 },
            { name: 'Predictivo', value: 200 },
          ],
          completionTrend: [
            { name: 'Semana 1', value: 85 },
            { name: 'Semana 2', value: 78 },
            { name: 'Semana 3', value: 92 },
            { name: 'Semana 4', value: 88 },
          ],
          costByMonth: [
            { name: 'Ene', value: 10200 },
            { name: 'Feb', value: 8450 },
            { name: 'Mar', value: 9600 },
            { name: 'Abr', value: 8800 },
            { name: 'May', value: 9900 },
            { name: 'Jun', value: 11550 },
          ],
          mttrTrend: [
            { name: 'Ene', value: 3.5 },
            { name: 'Feb', value: 3.2 },
            { name: 'Mar', value: 3.0 },
            { name: 'Abr', value: 2.9 },
            { name: 'May', value: 2.8 },
            { name: 'Jun', value: 3.1 },
          ],
          otRatioPreventiveVsCorrective: [
            { name: 'Preventivo', value: 620 },
            { name: 'Correctivo', value: 430 },
          ],
        };

        setData(mockData);
      } catch (err) {
        setError('Error al cargar los datos de BI');
        console.error('Error fetching BI data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBiData();
  }, []);

  return { data, loading, error };
};
