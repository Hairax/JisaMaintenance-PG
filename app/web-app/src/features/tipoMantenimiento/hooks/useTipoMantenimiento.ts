import { useCallback, useEffect, useState, useRef } from 'react';
import {
  TipoMantenimiento,
  TipoMantenimientoFormData,
  ModalMode,
  TipoMantenimientoManagementState,
} from '../types/tipoMantenimiento.types';

const API_BASE_URL = 'http://localhost:3000/tipo-mantenimientos';

export function useTipoMantenimiento() {
  const [state, setState] = useState<TipoMantenimientoManagementState>({
    tiposMantenimiento: [],
    loading: false,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedTipoMantenimiento: null,
    formData: {},
    showDeleteConfirm: false,
    deleteCountdown: 0,
    canConfirmDelete: false,
  });

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const fetchTiposMantenimiento = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Error al cargar tipos de mantenimiento',
        );
      }
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        tiposMantenimiento: data,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        tiposMantenimiento: [],
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchTiposMantenimiento();
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [fetchTiposMantenimiento]);

  const handleOpenModal = (
    mode: ModalMode,
    tipo?: TipoMantenimiento | null,
  ) => {
    setState((prev) => ({
      ...prev,
      isModalOpen: true,
      modalMode: mode,
      selectedTipoMantenimiento: tipo ?? null,
      formData: tipo
        ? {
            id: tipo.id,
            nombre: tipo.nombre,
            createdAt: tipo.createdAt,
            updatedAt: tipo.updatedAt,
          }
        : {},
    }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedTipoMantenimiento: null,
      formData: {},
      showDeleteConfirm: false,
      deleteCountdown: 0,
      canConfirmDelete: false,
    }));
  };

  const handleInputChange = (name: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
  };

  const handleCreateTipoMantenimiento = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Error al crear tipo de mantenimiento',
        );
      }
      await fetchTiposMantenimiento();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear',
        loading: false,
      }));
    }
  };

  const handleUpdateTipoMantenimiento = async () => {
    if (!state.selectedTipoMantenimiento) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/${state.selectedTipoMantenimiento.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.formData),
        },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Error al actualizar tipo de mantenimiento',
        );
      }
      await fetchTiposMantenimiento();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al actualizar',
        loading: false,
      }));
    }
  };

  const handleDeleteClick = () => {
    if (!state.selectedTipoMantenimiento) return;
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

  const handleDeleteTipoMantenimiento = async () => {
    if (!state.selectedTipoMantenimiento) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/${state.selectedTipoMantenimiento.id}`,
        { method: 'DELETE' },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Error al eliminar tipo de mantenimiento',
        );
      }
      await fetchTiposMantenimiento();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al eliminar',
        loading: false,
      }));
    }
  };

  return {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateTipoMantenimiento,
    handleUpdateTipoMantenimiento,
    handleDeleteClick,
    handleDeleteTipoMantenimiento,
  };
}
