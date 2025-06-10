import { useCallback, useEffect, useState } from 'react';
import {
  RepuestoMaquina,
  CreateRepuestoMaquinaDto,
  UpdateRepuestoMaquinaDto,
} from '../types/repuestoMaquina.types';

const API_BASE_URL = 'http://localhost:3000/repuesto-maquina';

interface UseRepuestoMaquinaState {
  repuestos: RepuestoMaquina[];
  loading: boolean;
  error: string | null;
  selectedRepuesto: RepuestoMaquina | null;
}

export function useRepuestoMaquina() {
  const [state, setState] = useState<UseRepuestoMaquinaState>({
    repuestos: [],
    loading: false,
    error: null,
    selectedRepuesto: null,
  });

  const fetchRepuestos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar repuestos');
      }
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        repuestos: data,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        repuestos: [],
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchRepuestos();
  }, [fetchRepuestos]);

  const createRepuesto = async (dto: CreateRepuestoMaquinaDto) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear repuesto');
      }
      await fetchRepuestos();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false,
      }));
    }
  };

  const updateRepuesto = async (id: number, dto: UpdateRepuestoMaquinaDto) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar repuesto');
      }
      await fetchRepuestos();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false,
      }));
    }
  };

  const deleteRepuesto = async (id: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar repuesto');
      }
      await fetchRepuestos();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false,
      }));
    }
  };

  const selectRepuesto = (repuesto: RepuestoMaquina | null) => {
    setState((prev) => ({
      ...prev,
      selectedRepuesto: repuesto,
    }));
  };

  return {
    ...state,
    fetchRepuestos,
    createRepuesto,
    updateRepuesto,
    deleteRepuesto,
    selectRepuesto,
  };
}
