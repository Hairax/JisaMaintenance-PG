import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Process,
  CreateProcessDto,
  UpdateProcessDto,
} from '../types/process.types';

const API_BASE_URL = 'http://localhost:3000/process';
const COST_CENTER_API_URL = 'http://localhost:3000/cost-centers';

type ModalMode = 'view' | 'edit' | 'add';

export interface CostCenter {
  id: number;
  name: string;
}

interface ProcessManagementState {
  processes: Process[];
  costCenters: CostCenter[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedProcess: Process | null;
  formData: Partial<Process>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
}

export function useProcess() {
  const [state, setState] = useState<ProcessManagementState>({
    processes: [],
    costCenters: [],
    loading: true,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedProcess: null,
    formData: {},
    showDeleteConfirm: false,
    deleteCountdown: 10,
    canConfirmDelete: false,
  });

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Fetch all cost centers
  const fetchCostCenters = useCallback(async () => {
    try {
      const res = await fetch(COST_CENTER_API_URL);
      if (!res.ok) {
        throw new Error('Error al cargar centros de costo');
      }
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        costCenters: data,
      }));
    } catch (err) {
      console.error('Error loading cost centers:', err);
      setState((prev) => ({
        ...prev,
        costCenters: [],
      }));
    }
  }, []);

  // Fetch all processes
  const fetchProcesses = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar procesos');
      }
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        processes: data,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al cargar procesos',
        processes: [],
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchProcesses();
    fetchCostCenters();
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [fetchProcesses, fetchCostCenters]);

  const handleOpenModal = (mode: ModalMode, process: Process | null = null) => {
    setState((prev) => ({
      ...prev,
      modalMode: mode,
      selectedProcess: process,
      formData:
        mode === 'add'
          ? { id: 0, createdAt: new Date(), updatedAt: new Date() }
          : process
            ? { ...process }
            : {},
      isModalOpen: true,
      showDeleteConfirm: false,
      canConfirmDelete: false,
    }));
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
  };

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedProcess: null,
      formData: {},
      showDeleteConfirm: false,
      canConfirmDelete: false,
    }));
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value,
      },
    }));
  };

  const handleCreateProcess = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const correlativoValue =
        state.formData.correlativo !== undefined &&
        state.formData.correlativo !== ''
          ? Number(state.formData.correlativo)
          : undefined;

      const dto: CreateProcessDto = {
        name: state.formData.name as string,
        centroCosto_id: Number(state.formData.centroCosto),
        correlativo: correlativoValue,
      };
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear proceso');
      }
      const newProcess = await res.json();
      setState((prev) => ({
        ...prev,
        processes: [...prev.processes, newProcess],
        loading: false,
        isModalOpen: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear proceso',
        loading: false,
      }));
    }
  };

  const handleUpdateProcess = async () => {
    if (!state.selectedProcess) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const correlativoValue =
        state.formData.correlativo !== undefined &&
        state.formData.correlativo !== ''
          ? Number(state.formData.correlativo)
          : undefined;

      const dto: UpdateProcessDto = {
        name: state.formData.name,
        centroCosto_id: state.formData.centroCosto
          ? Number(state.formData.centroCosto)
          : undefined,
        correlativo: correlativoValue,
      };
      const res = await fetch(`${API_BASE_URL}/${state.selectedProcess.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar proceso');
      }
      const updatedProcess = await res.json();
      setState((prev) => ({
        ...prev,
        processes: prev.processes.map((p) =>
          p.id === updatedProcess.id ? updatedProcess : p,
        ),
        loading: false,
        isModalOpen: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Error al actualizar proceso',
        loading: false,
      }));
    }
  };

  const handleDeleteClick = () => {
    if (!state.selectedProcess) return;
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
    if (!state.selectedProcess) return;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/${state.selectedProcess.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar proceso');
      setState((prev) => ({
        ...prev,
        processes: prev.processes.filter(
          (p) => p.id !== state.selectedProcess?.id,
        ),
        loading: false,
      }));
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al eliminar proceso',
        loading: false,
      }));
    }
  };

  return {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateProcess,
    handleUpdateProcess,
    handleDeleteClick,
    handleDelete,
    fetchCostCenters,
  };
}
