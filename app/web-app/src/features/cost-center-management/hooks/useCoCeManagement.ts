import { useState, useCallback, useRef, useEffect } from 'react';
import { CostCenter } from '../../../shared/types/cost-center.types';
import { CostCenterManagementState, ModalMode } from '../types/coce.types';

const API_BASE_URL = 'http://localhost:3000';

export const useCoCeManagement = () => {
  const [state, setState] = useState<CostCenterManagementState>({
    costCenters: [],
    loading: true,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedCostCenter: null,
    formData: {},
    showDeleteConfirm: false,
    deleteCountdown: 10,
    canConfirmDelete: false,
  });
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const fetchCostCenters = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/cost-centers`);
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido en la respuesta' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      const data = await res.json();
      setState((prev) => ({ ...prev, costCenters: data, loading: false }));
    } catch (err) {
      console.error('Fetch error:', err);
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error
            ? err.message
            : 'Error al cargar centros de costo',
        costCenters: [],
        loading: false,
      }));
    }
  }, []);
  useEffect(() => {
    fetchCostCenters();
  }, [fetchCostCenters]);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleOpenModal = (
    mode: ModalMode,
    costCenter: CostCenter | null = null,
  ) => {
    setState((prev) => ({
      ...prev,
      modalMode: mode,
      selectedCostCenter: costCenter,
      formData:
        mode === 'add'
          ? { id: 0, createdAt: new Date(), updatedAt: new Date() }
          : costCenter
            ? { ...costCenter }
            : {},
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
      selectedCostCenter: null,
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
  const handleCreateCostCenter = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/cost-centers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido en la respuesta' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      const newCostCenter = await res.json();
      setState((prev) => ({
        ...prev,
        costCenters: [...prev.costCenters, newCostCenter],
        loading: false,
        isModalOpen: false,
      }));
    } catch (err) {
      console.error('Fetch error:', err);
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Error al crear centro de costo',
        loading: false,
      }));
    }
  };
  const handleUpdateCostCenter = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/cost-centers/${state.selectedCostCenter?.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(state.formData),
        },
      );
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido en la respuesta' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      const updatedCostCenter = await res.json();
      setState((prev) => ({
        ...prev,
        costCenters: prev.costCenters.map((costCenter) =>
          costCenter.id === updatedCostCenter.id
            ? updatedCostCenter
            : costCenter,
        ),
        loading: false,
        isModalOpen: false,
      }));
    } catch (err) {
      console.error('Fetch error:', err);
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error
            ? err.message
            : 'Error al actualizar centro de costo',
        loading: false,
      }));
    }
  };

  const handleDeleteClick = () => {
    if (!state.selectedCostCenter) return;

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
    if (!state.selectedCostCenter) return;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/cost-centers/${state.selectedCostCenter.id}`,
        {
          method: 'DELETE',
        },
      );
      if (!res.ok) throw new Error('Error al eliminar centro de costo');
      setState((prev) => ({
        ...prev,
        costCenters: prev.costCenters.filter(
          (costCenter) => costCenter.id !== state.selectedCostCenter?.id,
        ),
        loading: false,
      }));
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error
            ? err.message
            : 'Error al eliminar centro de costo',
        loading: false,
      }));
    }
  };
  return {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateCostCenter,
    handleUpdateCostCenter,
    handleDeleteClick,
    handleDelete,
  };
};
