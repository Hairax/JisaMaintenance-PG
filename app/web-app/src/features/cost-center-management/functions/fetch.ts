import { useCallback } from 'react';
import { CostCenter } from '../../../shared/types/cost-center.types';

const API_BASE_URL = 'http://localhost:3000';

export const fetchCostCenters = (
  setCostCenters: (data: CostCenter[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
) =>
  useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/cost-centers`);
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido en la respuesta' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      const data = await res.json();
      setCostCenters(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(
        err instanceof Error ? err.message : 'Error al cargar centros de costo',
      );
      setCostCenters([]);
    } finally {
      setLoading(false);
    }
  }, [setCostCenters, setLoading, setError]);
