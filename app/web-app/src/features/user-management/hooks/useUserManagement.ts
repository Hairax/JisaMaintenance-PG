import { useState, useCallback, useRef, useEffect } from 'react';
import { User } from '../../../shared/types/user.types';
import { UserManagementState, ModalMode } from '../types/user.types';
import { API_URL } from '../../../shared/config/api';

const API_BASE_URL = API_URL;

export const useUserManagement = () => {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    loading: true,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedUser: null,
    formData: {},
    showDeleteConfirm: false,
    deleteCountdown: 10,
    canConfirmDelete: false,
  });
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const fetchUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido en la respuesta' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      const data = await res.json();
      setState((prev) => ({ ...prev, users: data, loading: false }));
    } catch (err) {
      console.error('Fetch error:', err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al cargar usuarios',
        users: [],
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleOpenModal = (mode: ModalMode, user: User | null = null) => {
    setState((prev) => ({
      ...prev,
      modalMode: mode,
      selectedUser: user,
      formData:
        mode === 'add' ? { hora$: 0, minutos$: 0 } : user ? { ...user } : {},
      isModalOpen: true,
      showDeleteConfirm: false,
      canConfirmDelete: false,
    }));

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedUser: null,
      formData: {},
      modalMode: 'view',
      showDeleteConfirm: false,
      canConfirmDelete: false,
    }));

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const processedValue = name === 'status' ? value === 'true' : value;

    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: processedValue },
    }));
  };

  const handleCreateUser = async () => {
    if (
      !state.formData.name ||
      !state.formData.email ||
      !state.formData.password
    ) {
      alert('Nombre, Email y Contraseña son requeridos.');
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state.formData,
          status: state.formData.status ?? true,
        }),
      });
      if (!res.ok) throw new Error('Error al crear usuario');
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear',
        loading: false,
      }));
    }
  };

  const handleUpdateUser = async () => {
    if (!state.selectedUser) return;
    const updateData = { ...state.formData };

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/${state.selectedUser.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        },
      );

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }

      const updatedUser = await res.json();
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === state.selectedUser?.id ? updatedUser : u,
        ),
        loading: false,
      }));
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
    if (!state.selectedUser) return;

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

  const handleDelete = async () => {
    if (!state.selectedUser) return;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/${state.selectedUser.id}`,
        {
          method: 'DELETE',
        },
      );
      if (!res.ok) throw new Error('Error al eliminar usuario');
      setState((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== state.selectedUser?.id),
        loading: false,
      }));
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
    handleCreateUser,
    handleUpdateUser,
    handleDeleteClick,
    handleDelete,
  };
};
