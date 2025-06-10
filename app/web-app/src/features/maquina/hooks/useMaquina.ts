import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Maquina,
  MaquinaManagementState,
  ModalMode,
} from '../types/maquina.types';

const API_BASE_URL = 'http://localhost:3000';

export const useMaquina = () => {
  const [state, setState] = useState<MaquinaManagementState>({
    maquinas: [],
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

  useEffect(() => {
    fetchMaquinas();
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [fetchMaquinas]);

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
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
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
