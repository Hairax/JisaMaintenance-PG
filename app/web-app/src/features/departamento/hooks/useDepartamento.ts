import { useCallback, useEffect, useState } from 'react';
import {
  Departamento,
  CreateDepartamentoDto,
  UpdateDepartamentoDto,
} from '../types/departamento.types';

const API_BASE_URL = 'http://localhost:3000/departamentos';

interface UseDepartamentoState {
  departamentos: Departamento[];
  loading: boolean;
  error: string | null;
  selectedDepartamento: Departamento | null;
}

export function useDepartamento() {
  const [state, setState] = useState<UseDepartamentoState>({
    departamentos: [],
    loading: false,
    error: null,
    selectedDepartamento: null,
  });

  const fetchDepartamentos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar departamentos');
      }
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        departamentos: data,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        departamentos: [],
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchDepartamentos();
  }, [fetchDepartamentos]);

  const createDepartamento = async (dto: CreateDepartamentoDto) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear departamento');
      }
      await fetchDepartamentos();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false,
      }));
    }
  };

  const updateDepartamento = async (id: number, dto: UpdateDepartamentoDto) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Error al actualizar departamento',
        );
      }
      await fetchDepartamentos();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false,
      }));
    }
  };

  const deleteDepartamento = async (id: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar departamento');
      }
      await fetchDepartamentos();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false,
      }));
    }
  };

  const selectDepartamento = (departamento: Departamento | null) => {
    setState((prev) => ({
      ...prev,
      selectedDepartamento: departamento,
    }));
  };

  return {
    ...state,
    fetchDepartamentos,
    createDepartamento,
    updateDepartamento,
    deleteDepartamento,
    selectDepartamento,
  };
}
