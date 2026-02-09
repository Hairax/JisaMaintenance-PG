import { useState, useCallback, useRef, useEffect } from 'react';
import {
  OrdenTrabajo,
  OrdenTrabajoFormData,
  OTManagementState,
  ModalMode,
} from '../types/ot.types';

const API_BASE_URL = 'http://localhost:3000/ots';

export function useOt() {
  // Estado principal
  const [state, setState] = useState<OTManagementState>({
    ots: [],
    loading: true,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedOT: null,
    formData: {},
    showDeleteConfirm: false,
    deleteCountdown: 10,
    canConfirmDelete: false,
  });
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // 1. Estados para las listas de opciones
  const [tiposMantenimiento, setTiposMantenimiento] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [centrosCosto, setCentrosCosto] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [procesos, setProcesos] = useState<{ id: number; nombre: string }[]>(
    [],
  );
  const [maquinas, setMaquinas] = useState<{ id: number; nombre: string }[]>(
    [],
  );
  const [tecnicos, setTecnicos] = useState<{ id: number; nombre: string }[]>(
    [],
  );
  // ...otros catálogos si necesitas...

  // 2. Efecto para cargar las listas al montar el hook
  useEffect(() => {
    fetch('http://localhost:3000/tipo-mantenimientos')
      .then((res) => res.json())
      .then(setTiposMantenimiento);
    fetch('http://localhost:3000/cost-centers')
      .then((res) => res.json())
      .then(setCentrosCosto);
    fetch('http://localhost:3000/process')
      .then((res) => res.json())
      .then(setProcesos);
    fetch('http://localhost:3000/maquinas')
      .then((res) => res.json())
      .then(setMaquinas);
    fetch('http://localhost:3000/users')
      .then((res) => res.json())
      .then(setTecnicos);
    // ...otros fetch si necesitas...
  }, []);

  // Fetch all OTs
  const fetchOts = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error('Error al cargar órdenes de trabajo');
      const data = await res.json();
      setState((prev) => ({ ...prev, ots: data, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al cargar OTs',
        ots: [],
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchOts();
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [fetchOts]);

  // Modal handlers
  const handleOpenModal = (mode: ModalMode, ot: OrdenTrabajo | null = null) => {
    setState((prev) => ({
      ...prev,
      modalMode: mode,
      selectedOT: ot,
      formData: mode === 'create' ? {} : ot ? { ...ot } : {},
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
      selectedOT: null,
      formData: {},
      showDeleteConfirm: false,
      canConfirmDelete: false,
    }));
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
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
      formData: { ...prev.formData, [name]: value },
    }));
  };

  // Create OT
  const handleCreateOt = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) throw new Error('Error al crear OT');
      await fetchOts();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear OT',
        loading: false,
      }));
    }
  };

  // Update OT
  const handleUpdateOt = async () => {
    if (!state.selectedOT) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/${state.selectedOT.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) throw new Error('Error al actualizar OT');
      await fetchOts();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al actualizar OT',
        loading: false,
      }));
    }
  };

  // Delete OT
  const handleDeleteOt = async () => {
    if (!state.selectedOT) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE_URL}/${state.selectedOT.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar OT');
      await fetchOts();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al eliminar OT',
        loading: false,
      }));
    }
  };

  // Delete confirmation logic
  const handleDeleteClick = () => {
    if (!state.selectedOT) return;
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

  return {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateOt,
    handleUpdateOt,
    handleDeleteClick,
    handleDeleteOt,
    fetchOts,
    tiposMantenimiento,
    centrosCosto,
    procesos,
    maquinas,
    tecnicos,
  };
}
