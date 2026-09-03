import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Maquina,
  MaquinaManagementState,
  ModalMode,
} from '../types/maquina.types';
import { API_URL } from '../../../shared/config/api';

const API_BASE_URL = API_URL;

export interface SelectOption {
  id: number;
  name: string;
}

export interface ProcessOption extends SelectOption {
  centroCosto: number;
  correlativo?: number;
}

interface ExtendedMaquinaState extends MaquinaManagementState {
  centrosCosto: SelectOption[];
  procesos: ProcessOption[];
  proveedores: SelectOption[];
}

export const useMaquina = () => {
  const [state, setState] = useState<ExtendedMaquinaState>({
    maquinas: [],
    centrosCosto: [],
    procesos: [],
    proveedores: [],
    loading: true,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedMaquina: null,
    formData: {},
    showDeleteConfirm: false,
    deleteCountdown: 10,
    canConfirmDelete: false,
  });

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const fetchMaquinas = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/maquinas`);
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      const data = await res.json();
      setState((prev) => ({ ...prev, maquinas: data, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al cargar máquinas',
        maquinas: [],
        loading: false,
      }));
    }
  }, []);

  // Fetch Centro de Costos
  const fetchCentrosCosto = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cost-centers`);
      if (!res.ok) throw new Error('Error al cargar centros de costo');
      const data = await res.json();
      setState((prev) => ({ ...prev, centrosCosto: data }));
    } catch (err) {
      console.error('Error loading cost centers:', err);
    }
  }, []);

  const formatProcessName = (process: {
    correlativo?: number;
    name: string;
  }) => {
    const correlativo = process.correlativo;
    const prefix =
      correlativo !== undefined && correlativo !== null
        ? String(correlativo).padStart(2, '0')
        : '??';
    return `${prefix} - ${process.name}`;
  };

  // Fetch Procesos
  const fetchProcesos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/process`);
      if (!res.ok) throw new Error('Error al cargar procesos');
      const data = await res.json();
      const procesos = (
        data as {
          id: number;
          name: string;
          centroCosto: number;
          correlativo?: number;
        }[]
      ).map((process) => ({
        id: process.id,
        name: formatProcessName(process),
        centroCosto: process.centroCosto,
        correlativo: process.correlativo,
      }));
      setState((prev) => ({ ...prev, procesos }));
    } catch (err) {
      console.error('Error loading processes:', err);
    }
  }, []);

  // Fetch Proveedores
  const fetchProveedores = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/proveedores`);
      if (!res.ok) throw new Error('Error al cargar proveedores');
      const data = await res.json();
      // Transformar 'nombre' a 'name' para compatibilidad con SearchableSelect
      const transformedData = (data as { id: number; nombre: string }[]).map(
        (proveedor) => ({
          id: proveedor.id,
          name: proveedor.nombre,
        }),
      );
      setState((prev) => ({ ...prev, proveedores: transformedData }));
    } catch (err) {
      console.error('Error loading providers:', err);
    }
  }, []);

  useEffect(() => {
    fetchMaquinas();
    fetchCentrosCosto();
    fetchProcesos();
    fetchProveedores();
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [fetchMaquinas, fetchCentrosCosto, fetchProcesos, fetchProveedores]);

  const handleOpenModal = (mode: ModalMode, maquina: Maquina | null = null) => {
    setState((prev) => ({
      ...prev,
      modalMode: mode,
      selectedMaquina: maquina,
      formData: maquina ? { ...maquina } : {},
      isModalOpen: true,
      error: null,
    }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedMaquina: null,
      formData: {},
      error: null,
      showDeleteConfirm: false,
      deleteCountdown: 10,
      canConfirmDelete: false,
    }));
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
  };

  const handleInputChange = (name: string, value: unknown) => {
    setState((prev) => {
      const updatedFormData = { ...prev.formData, [name]: value };

      if (name === 'centroCosto_id' && updatedFormData.proceso_id) {
        const selectedProceso = prev.procesos.find(
          (process) => process.id === Number(updatedFormData.proceso_id),
        );
        if (selectedProceso?.centroCosto !== Number(value)) {
          updatedFormData.proceso_id = undefined;
        }
      }

      return {
        ...prev,
        formData: updatedFormData,
      };
    });
  };

  const handleCreateMaquina = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/maquinas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      await fetchMaquinas();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear máquina',
        loading: false,
      }));
    }
  };

  const handleUpdateMaquina = async () => {
    if (!state.selectedMaquina) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/maquinas/${state.selectedMaquina.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.formData),
        },
      );
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      await fetchMaquinas();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Error al actualizar máquina',
        loading: false,
      }));
    }
  };

  const handleDeleteClick = () => {
    if (!state.selectedMaquina) return;
    setState((prev) => ({
      ...prev,
      showDeleteConfirm: true,
      deleteCountdown: 10,
      canConfirmDelete: false,
    }));
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.deleteCountdown <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return { ...prev, canConfirmDelete: true, deleteCountdown: 0 };
        }
        return { ...prev, deleteCountdown: prev.deleteCountdown - 1 };
      });
    }, 1000);
  };

  const handleDelete = async () => {
    if (!state.selectedMaquina) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/maquinas/${state.selectedMaquina.id}`,
        {
          method: 'DELETE',
        },
      );
      if (!res.ok) throw new Error('Error al eliminar máquina');
      await fetchMaquinas();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al eliminar máquina',
        loading: false,
      }));
    }
  };

  return {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateMaquina,
    handleUpdateMaquina,
    handleDeleteClick,
    handleDelete,
    fetchMaquinas,
  };
};
