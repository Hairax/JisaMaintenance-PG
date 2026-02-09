import { useState, useCallback, useEffect } from 'react';
import {
  InformeDiarioTrabajo,
  InformeDetalleTrabajo,
  InformeManagementState,
  ModalMode,
  InformeDiarioFormData,
  InformeDetalleFormData,
} from '../types/informe.types';

const API_DIARIO_CREATE_URL = 'http://localhost:3000/informe/diario.create';
const API_DIARIO_FINDALL_URL = 'http://localhost:3000/informe/diario.findAll';
const API_DETALLE_CREATE_URL = 'http://localhost:3000/informe/detalle.create';
const API_DETALLE_FINDALL_URL = 'http://localhost:3000/informe/detalle.findAll';

export function useInforme() {
  const [state, setState] = useState<InformeManagementState>({
    informes: [],
    detalles: [],
    loading: true,
    error: null,
    isModalOpen: false,
    modalMode: 'view',
    selectedInforme: null,
    selectedDetalle: null,
    formData: {},
    detalleFormData: {},
  });

  // Cargar informes diarios
  const fetchInformes = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_DIARIO_FINDALL_URL);
      if (!res.ok) throw new Error('Error al cargar informes');
      const data = await res.json();
      setState((prev) => ({ ...prev, informes: data, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al cargar informes',
        informes: [],
        loading: false,
      }));
    }
  }, []);

  // Cargar detalles de informe (opcional, si lo necesitas en la UI)
  const fetchDetalles = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_DETALLE_FINDALL_URL);
      if (!res.ok) throw new Error('Error al cargar detalles');
      const data = await res.json();
      setState((prev) => ({ ...prev, detalles: data, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al cargar detalles',
        detalles: [],
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchInformes();
    // fetchDetalles(); // Descomenta si necesitas cargar detalles al inicio
  }, [fetchInformes]);

  // Modal handlers
  const handleOpenModal = (
    mode: ModalMode,
    informe: InformeDiarioTrabajo | null = null,
  ) => {
    setState((prev) => ({
      ...prev,
      modalMode: mode,
      selectedInforme: informe,
      formData: mode === 'create' ? {} : informe ? { ...informe } : {},
      isModalOpen: true,
    }));
  };
  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedInforme: null,
      formData: {},
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
      formData: { ...prev.formData, [name]: value },
    }));
  };

  // CRUD methods para informes diarios
  const handleCreateInforme = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(API_DIARIO_CREATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData),
      });
      if (!res.ok) throw new Error('Error al crear informe');
      await fetchInformes();
      handleCloseModal();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear informe',
        loading: false,
      }));
    }
  };

  // Puedes agregar aquí handleUpdateInforme, handleDeleteInforme, etc. usando las rutas correctas

  return {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateInforme,
    fetchInformes,
    fetchDetalles, // Exporta si lo necesitas
  };
}
