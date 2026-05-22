import { useEffect, useRef, useState } from 'react';
import {
  SubUnidad,
  ModalMode,
  SubUnidadFormData,
  SubUnidadManagementState,
} from '../types/subUnidad.types';

const API_BASE_URL = 'http://localhost:3000/subunidades';

export interface SelectOption {
  id: number;
  name: string;
}

export interface ProcessOption extends SelectOption {
  centroCosto: number;
  correlativo?: number;
}

export interface MachineOption extends SelectOption {
  centroCosto: number;
  proceso: number;
  correlativo?: number;
}

interface ExtendedSubUnidadState extends SubUnidadManagementState {
  centrosCosto: SelectOption[];
  procesos: ProcessOption[];
  maquinas: MachineOption[];
}

export const useSubUnidad = () => {
  const [state, setState] = useState<ExtendedSubUnidadState>({
    subUnidades: [],
    centrosCosto: [],
    procesos: [],
    maquinas: [],
    loading: false,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedSubUnidad: null,
    formData: {},
    showDeleteConfirm: false,
    deleteCountdown: 0,
    canConfirmDelete: false,
  });

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Fetch all SubUnidades
  const fetchSubUnidades = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error('Error al cargar subunidades');
      const data = await res.json();
      setState((prev) => ({ ...prev, subUnidades: data, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Error al cargar subunidades',
        subUnidades: [],
        loading: false,
      }));
    }
  };

  const fetchCentrosCosto = async () => {
    try {
      const res = await fetch('http://localhost:3000/cost-centers');
      if (!res.ok) throw new Error('Error al cargar centros de costo');
      const data = await res.json();
      setState((prev) => ({ ...prev, centrosCosto: data }));
    } catch (err) {
      console.error('Error cargando centros de costo:', err);
    }
  };

  const formatProcessName = (process: any) => {
    const correlativo = process.correlativo;
    const prefix =
      correlativo !== null && correlativo !== undefined
        ? String(correlativo).padStart(2, '0')
        : '??';
    return `${prefix} - ${process.name}`;
  };

  const formatMachineName = (machine: any) => {
    const correlativo = machine.correlativo;
    const prefix =
      correlativo !== null && correlativo !== undefined
        ? String(correlativo).padStart(2, '0')
        : '??';
    return `${prefix} - ${machine.name}`;
  };

  const fetchProcesos = async () => {
    try {
      const res = await fetch('http://localhost:3000/process');
      if (!res.ok) throw new Error('Error al cargar procesos');
      const data = await res.json();
      const procesos = data.map((process: any) => ({
        id: process.id,
        name: formatProcessName(process),
        centroCosto: process.centroCosto,
        correlativo: process.correlativo,
      }));
      setState((prev) => ({ ...prev, procesos }));
    } catch (err) {
      console.error('Error cargando procesos:', err);
    }
  };

  const fetchMaquinas = async () => {
    try {
      const res = await fetch('http://localhost:3000/maquinas');
      if (!res.ok) throw new Error('Error al cargar máquinas');
      const data = await res.json();
      const maquinas = data.map((machine: any) => ({
        id: machine.id,
        name: formatMachineName(machine),
        centroCosto: machine.centroCosto_id,
        proceso: machine.proceso_id,
        correlativo: machine.correlativo,
      }));
      setState((prev) => ({ ...prev, maquinas }));
    } catch (err) {
      console.error('Error cargando máquinas:', err);
    }
  };

  useEffect(() => {
    fetchSubUnidades();
    fetchCentrosCosto();
    fetchProcesos();
    fetchMaquinas();
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const getMachineById = (id?: number) =>
    state.maquinas.find((machine) => machine.id === id);

  const getProcessById = (id?: number) =>
    state.procesos.find((process) => process.id === id);

  // Modal handlers
  const handleOpenModal = (
    mode: ModalMode,
    subUnidad: SubUnidad | null = null,
  ) => {
    const machine = subUnidad
      ? getMachineById(subUnidad.maquina_id)
      : undefined;
    setState((prev) => ({
      ...prev,
      modalMode: mode,
      isModalOpen: true,
      selectedSubUnidad: subUnidad,
      formData: subUnidad
        ? {
            id: subUnidad.id,
            descripcion: subUnidad.descripcion,
            maquina_id: subUnidad.maquina_id,
            centroCosto_id: machine?.centroCosto,
            proceso_id: machine?.proceso,
            correlativo: subUnidad.correlativo,
            createdAt: subUnidad.createdAt,
            updatedAt: subUnidad.updatedAt,
          }
        : {},
    }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedSubUnidad: null,
      formData: {},
      modalMode: 'view',
      error: null,
    }));
  };

  // Form input handler
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setState((prev) => {
      const updatedFormData = {
        ...prev.formData,
        [name]:
          name === 'maquina_id' ||
          name === 'centroCosto_id' ||
          name === 'proceso_id'
            ? Number(value)
            : name === 'correlativo'
              ? value === ''
                ? undefined
                : Number(value)
              : value,
      };

      if (name === 'centroCosto_id') {
        updatedFormData.proceso_id = undefined;
        updatedFormData.maquina_id = undefined;
      }

      if (name === 'proceso_id') {
        updatedFormData.maquina_id = undefined;
      }

      return {
        ...prev,
        formData: updatedFormData,
      };
    });
  };

  const buildPayload = () => {
    return {
      maquina_id: state.formData.maquina_id,
      descripcion: state.formData.descripcion,
      correlativo: state.formData.correlativo,
    };
  };

  // Create
  const handleCreateSubUnidad = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const payload = buildPayload();
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al crear subunidad');
      await fetchSubUnidades();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear subunidad',
        loading: false,
      }));
    }
  };

  // Update
  const handleUpdateSubUnidad = async () => {
    if (!state.selectedSubUnidad) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const payload = buildPayload();
      const res = await fetch(`${API_BASE_URL}/${state.selectedSubUnidad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al actualizar subunidad');
      await fetchSubUnidades();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Error al actualizar subunidad',
        loading: false,
      }));
    }
  };

  // Delete
  const handleDeleteClick = () => {
    if (!state.selectedSubUnidad) return;
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

  const handleDeleteSubUnidad = async () => {
    if (!state.selectedSubUnidad) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/${state.selectedSubUnidad.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar subunidad');
      await fetchSubUnidades();
      setState((prev) => ({
        ...prev,
        showDeleteConfirm: false,
        canConfirmDelete: false,
        isModalOpen: false,
        selectedSubUnidad: null,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Error al eliminar subunidad',
        loading: false,
      }));
    }
  };

  return {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateSubUnidad,
    handleUpdateSubUnidad,
    handleDeleteClick,
    handleDeleteSubUnidad,
  };
};
