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
    avgCompletionTime: number;
  };
  otsByMonth: BiDataPoint[];
  otsByDepartment: BiDataPoint[];
  otsByType: BiDataPoint[];
  completionTrend: BiDataPoint[];
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
        
        // TODO: Replace with actual API call
        // const response = await fetch('/api/bi/dashboard');
        // const biData = await response.json();
        
        // Mock data for now
        const mockData: BiData = {
          summary: {
            totalOTs: 1250,
            completedOTs: 980,
            pendingOTs: 270,
            avgCompletionTime: 4.2,
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
            { name: 'Sem 1', value: 85 },
            { name: 'Sem 2', value: 78 },
            { name: 'Sem 3', value: 92 },
            { name: 'Sem 4', value: 88 },
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

  return { data, loading, error, refetch: () => fetchBiData() };
};
