import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Objeto,
  ObjetoFormData,
  ModalMode,
  ObjetoManagementState,
} from '../types/objeto.types';

const API_BASE_URL = 'http://localhost:3000/objetos';

export function useObjeto() {
  const [state, setState] = useState<ObjetoManagementState>({
    objetos: [],
    loading: false,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedObjeto: null,
    formData: {},
    showDeleteConfirm: false,
    deleteCountdown: 0,
    canConfirmDelete: false,
  });

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const fetchObjetos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar objetos');
      }
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        objetos: data,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        objetos: [],
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchObjetos();
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [fetchObjetos]);

  const handleOpenModal = (mode: ModalMode, objeto: Objeto | null = null) => {
    setState((prev) => ({
      ...prev,
      isModalOpen: true,
      modalMode: mode,
      selectedObjeto: objeto,
      formData: objeto ? { ...objeto } : {},
      showDeleteConfirm: false,
      deleteCountdown: 0,
      canConfirmDelete: false,
    }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedObjeto: null,
      formData: {},
      showDeleteConfirm: false,
      deleteCountdown: 0,
      canConfirmDelete: false,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
  };

  const handleCreateObjeto = async () => {
    if (!state.formData.nombre) {
      alert('El nombre es requerido.');
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear objeto');
      }
      await fetchObjetos();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear',
        loading: false,
      }));
    }
  };

  const handleUpdateObjeto = async () => {
    if (!state.selectedObjeto) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/${state.selectedObjeto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar objeto');
      }
      await fetchObjetos();
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
    if (!state.selectedObjeto) return;
    setState((prev) => ({
      ...prev,
      showDeleteConfirm: true,
      deleteCountdown: 10,
      canConfirmDelete: false,
    }));
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
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

  const handleDeleteObjeto = async () => {
    if (!state.selectedObjeto) return;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/${state.selectedObjeto.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar objeto');
      await fetchObjetos();
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
    handleCreateObjeto,
    handleUpdateObjeto,
    handleDeleteClick,
    handleDeleteObjeto,
    fetchObjetos,
  };
}
