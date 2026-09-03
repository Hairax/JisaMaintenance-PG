import { useState, useCallback, useRef, useEffect } from 'react';
import { Proveedor } from '../../../shared/types/proveedor.types';
import {
  ProveedorManagementState,
  ModalMode,
} from '../types/proveedores.types';
import { API_URL } from '../../../shared/config/api';

const API_BASE_URL = `${API_URL}/proveedores`;

export function useProveedores() {
  const [state, setState] = useState<ProveedorManagementState>({
    proveedores: [],
    loading: true,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedProveedor: null,
    formData: {},
    showDeleteConfirm: false,
    deleteCountdown: 10,
    canConfirmDelete: false,
  });

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const fetchProveedores = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      const data = await res.json();
      setState((prev) => ({ ...prev, proveedores: data, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Error al cargar proveedores',
        proveedores: [],
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [fetchProveedores]);

  const handleOpenModal = (
    mode: ModalMode,
    proveedor: Proveedor | null = null,
  ) => {
    setState((prev) => ({
      ...prev,
      modalMode: mode,
      selectedProveedor: proveedor,
      formData: mode === 'create' ? {} : proveedor ? { ...proveedor } : {},
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
      selectedProveedor: null,
      formData: {},
      showDeleteConfirm: false,
      canConfirmDelete: false,
    }));
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

  const handleCreateProveedor = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear proveedor');
      }
      await fetchProveedores();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear proveedor',
        loading: false,
      }));
    }
  };

  const handleUpdateProveedor = async () => {
    if (!state.selectedProveedor) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/${state.selectedProveedor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar proveedor');
      }
      await fetchProveedores();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Error al actualizar proveedor',
        loading: false,
      }));
    }
  };

  const handleDeleteClick = () => {
    if (!state.selectedProveedor) return;
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
    if (!state.selectedProveedor) return;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/${state.selectedProveedor.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar proveedor');
      await fetchProveedores();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Error al eliminar proveedor',
        loading: false,
      }));
    }
  };

  return {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateProveedor,
    handleUpdateProveedor,
    handleDeleteClick,
    handleDelete,
    fetchProveedores,
  };
}
