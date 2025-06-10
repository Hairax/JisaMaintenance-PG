import { useEffect, useRef, useState } from 'react';
import {
  SubUnidad,
  ModalMode,
  SubUnidadManagementState,
} from '../types/subUnidad.types';

const API_BASE_URL = 'http://localhost:3000/subunidades';

export const useSubUnidad = () => {
  const [state, setState] = useState<SubUnidadManagementState>({
    subUnidades: [],
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

  useEffect(() => {
    fetchSubUnidades();
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Modal handlers
  const handleOpenModal = (
    mode: ModalMode,
    subUnidad: SubUnidad | null = null,
  ) => {
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
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: name === 'maquina_id' ? Number(value) : value,
      },
    }));
  };

  // Create
  const handleCreateSubUnidad = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
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
      const res = await fetch(`${API_BASE_URL}/${state.selectedSubUnidad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
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
