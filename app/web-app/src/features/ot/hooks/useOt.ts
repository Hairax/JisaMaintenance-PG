import { useState, useCallback, useRef, useEffect } from 'react';
import {
  OrdenTrabajo,
  OrdenTrabajoFormData,
  OTManagementState,
  ModalMode,
} from '../types/ot.types';
import { API_URL } from '../../../shared/config/api';

const API_BASE_URL = `${API_URL}/ots`;

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
  const [procesos, setProcesos] = useState<
    { id: number; nombre: string; centroCosto_id?: number }[]
  >([]);
  const [maquinas, setMaquinas] = useState<
    {
      id: number;
      nombre: string;
      proceso_id?: number;
      centroCosto_id?: number;
    }[]
  >([]);
  const [tecnicos, setTecnicos] = useState<{ id: number; nombre: string }[]>(
    [],
  );
  const [departamentos, setDepartamentos] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [objetos, setObjetos] = useState<{ id: number; nombre: string }[]>([]);
  const [supervisores, setSupervisores] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [subUnidades, setSubUnidades] = useState<
    { id: number; nombre: string; maquina_id?: number }[]
  >([]);

  // 2. Efecto para cargar las listas al montar el hook
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        // Cargar Tipos de Mantenimiento
        const resTypes = await fetch(`${API_URL}/tipo-mantenimientos`);
        if (resTypes.ok) {
          const dataTypes = await resTypes.json();
          setTiposMantenimiento(Array.isArray(dataTypes) ? dataTypes : []);
        }

        // Cargar Centros de Costo
        const resCenters = await fetch(`${API_URL}/cost-centers`);
        if (resCenters.ok) {
          const dataCenters = await resCenters.json();
          const centrosFormateados = Array.isArray(dataCenters)
            ? (dataCenters as { id: number; name?: string }[]).map(
                (center) => ({
                  id: center.id,
                  nombre: center.name || 'Sin nombre',
                }),
              )
            : [];
          setCentrosCosto(centrosFormateados);
        }

        // Cargar Procesos
        const resProcess = await fetch(`${API_URL}/process`);
        if (resProcess.ok) {
          const dataProcess = await resProcess.json();
          const procesosFormateados = Array.isArray(dataProcess)
            ? (
                dataProcess as {
                  id: number;
                  name?: string;
                  nombre?: string;
                  centroCosto?: number;
                  centroCosto_id?: number;
                  centroCostoId?: number;
                  costCenter_id?: number;
                  costCenterId?: number;
                }[]
              ).map((process) => ({
                id: process.id,
                nombre: process.name || process.nombre || 'Sin nombre',
                centroCosto_id:
                  process.centroCosto ??
                  process.centroCosto_id ??
                  process.centroCostoId ??
                  process.costCenter_id ??
                  process.costCenterId,
              }))
            : [];
          setProcesos(procesosFormateados);
        }

        // Cargar Máquinas
        const resMachines = await fetch(`${API_URL}/maquinas`);
        if (resMachines.ok) {
          const dataMachines = await resMachines.json();
          const maquinasFormateadas = Array.isArray(dataMachines)
            ? (
                dataMachines as {
                  id: number;
                  name?: string;
                  nombre?: string;
                  proceso_id?: number;
                  procesoId?: number;
                  process_id?: number;
                  centroCosto_id?: number;
                  centroCostoId?: number;
                  costCenter_id?: number;
                  costCenterId?: number;
                }[]
              ).map((maquina) => ({
                id: maquina.id,
                nombre: maquina.name || maquina.nombre || 'Sin nombre',
                proceso_id:
                  maquina.proceso_id ?? maquina.procesoId ?? maquina.process_id,
                centroCosto_id:
                  maquina.centroCosto_id ??
                  maquina.centroCostoId ??
                  maquina.costCenter_id ??
                  maquina.costCenterId,
              }))
            : [];
          setMaquinas(maquinasFormateadas);
        }

        // Cargar Usuarios/Técnicos
        const resUsers = await fetch(`${API_URL}/users`);
        if (resUsers.ok) {
          const dataUsers = await resUsers.json();
          // Mapear campos de User a { id, nombre }
          const tecnicosFormateados = Array.isArray(dataUsers)
            ? (
                dataUsers as { id: number; name?: string; lastName?: string }[]
              ).map((user) => ({
                id: user.id,
                nombre: `${user.name} ${user.lastName}`.trim(),
              }))
            : [];
          setTecnicos(tecnicosFormateados);
          // También usar como supervisores
          setSupervisores(tecnicosFormateados);
        }

        // Cargar Departamentos
        const resDepts = await fetch(`${API_URL}/departamentos`);
        if (resDepts.ok) {
          const dataDepts = await resDepts.json();
          const deptsFormateados = Array.isArray(dataDepts)
            ? (
                dataDepts as { id: number; nombre?: string; name?: string }[]
              ).map((dept) => ({
                id: dept.id,
                nombre: dept.nombre || dept.name || 'Sin nombre',
              }))
            : [];
          setDepartamentos(deptsFormateados);
        }

        // Cargar Objetos
        const resObjetos = await fetch(`${API_URL}/objetos`);
        if (resObjetos.ok) {
          const dataObjetos = await resObjetos.json();
          const objetosFormateados = Array.isArray(dataObjetos)
            ? (
                dataObjetos as { id: number; nombre?: string; name?: string }[]
              ).map((obj) => ({
                id: obj.id,
                nombre: obj.nombre || obj.name || 'Sin nombre',
              }))
            : [];
          setObjetos(objetosFormateados);
        }

        // Cargar SubUnidades
        const resSubUnidades = await fetch(`${API_URL}/subunidades`);
        if (resSubUnidades.ok) {
          const dataSubUnidades = await resSubUnidades.json();
          const subUnidadesFormateadas = Array.isArray(dataSubUnidades)
            ? (
                dataSubUnidades as {
                  id: number;
                  descripcion?: string;
                  name?: string;
                  maquina_id?: number;
                  maquinaId?: number;
                  machine_id?: number;
                }[]
              ).map((su) => ({
                id: su.id,
                nombre: su.descripcion || su.name || 'Sin nombre',
                maquina_id: su.maquina_id ?? su.maquinaId ?? su.machine_id,
              }))
            : [];
          setSubUnidades(subUnidadesFormateadas);
        }
      } catch (error) {
        console.error('Error cargando catálogos:', error);
      }
    };

    loadCatalogs();
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
    const initialFormData =
      mode === 'create'
        ? {}
        : ot
          ? {
              ...ot,
              tipoOT_id: ot.tipoOT_id ?? ot.tipoOT?.id,
              centroCosto_id: ot.centroCosto_id ?? ot.centroCosto?.id,
              proceso_id: ot.proceso_id ?? ot.proceso?.id,
              maquina_id: ot.maquina_id ?? ot.maquina?.id,
              subUnidad_id: ot.subUnidad_id ?? ot.subUnidad?.id,
              departamento_id: ot.departamento_id ?? ot.departamento?.id,
              objeto_id: ot.objeto_id ?? ot.objeto?.id,
              supervisor_id: ot.supervisor_id ?? ot.supervisor?.id,
              indicacionesEspeciales: ot.indicacionesEspeciales,
            }
          : {};

    setState((prev) => ({
      ...prev,
      modalMode: mode,
      selectedOT: ot,
      formData: initialFormData,
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
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | { target: { name: string; value: string | number | number[] } },
  ) => {
    const { name, value } = e.target;
    const numericFields = new Set([
      'tipoOT_id',
      'centroCosto_id',
      'proceso_id',
      'maquina_id',
      'subUnidad_id',
      'departamento_id',
      'objeto_id',
      'supervisor_id',
      'tipoCambio',
      'tiempoEstimado',
    ]);

    const parsedValue = numericFields.has(name)
      ? value === ''
        ? undefined
        : Number(value)
      : value;

    setState((prev) => {
      const updatedFormData = {
        ...prev.formData,
        [name]: parsedValue,
      } as Partial<OrdenTrabajoFormData>;

      if (name === 'centroCosto_id') {
        updatedFormData.proceso_id = undefined;
        updatedFormData.maquina_id = undefined;
        updatedFormData.subUnidad_id = undefined;
      }

      if (name === 'proceso_id') {
        updatedFormData.maquina_id = undefined;
        updatedFormData.subUnidad_id = undefined;
      }

      if (name === 'maquina_id') {
        updatedFormData.subUnidad_id = undefined;
      }

      return {
        ...prev,
        formData: updatedFormData,
      };
    });
  };

  // Create OT
  const handleCreateOt = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Preparar datos con campos obligatorios
      const dataToSend = {
        tipoOT_id: state.formData.tipoOT_id,
        centroCosto_id: state.formData.centroCosto_id,
        proceso_id: state.formData.proceso_id,
        maquina_id: state.formData.maquina_id,
        subUnidad_id: state.formData.subUnidad_id,
        tipoEjecucion: state.formData.tipoEjecucion || 'preventivo',
        departamento_id: state.formData.departamento_id,
        objeto_id: state.formData.objeto_id,
        supervisor_id: state.formData.supervisor_id,
        descripcionTarea: state.formData.descripcionTarea,
        fechaHora: state.formData.fechaHora,
        tipoCambio: state.formData.tipoCambio,
        tiempoEstimado: state.formData.tiempoEstimado,
        estado: state.formData.estado || 'Abierta',
        indicacionesEspeciales: state.formData.indicacionesEspeciales,
        tecnicos: state.formData.tecnicos || [],
      };

      console.log('Enviando datos al crear OT:', dataToSend);

      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
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
      // Preparar datos con campos obligatorios
      const dataToSend = {
        tipoOT_id: state.formData.tipoOT_id || state.selectedOT.tipoOT_id,
        centroCosto_id:
          state.formData.centroCosto_id || state.selectedOT.centroCosto_id,
        proceso_id: state.formData.proceso_id || state.selectedOT.proceso_id,
        maquina_id: state.formData.maquina_id || state.selectedOT.maquina_id,
        subUnidad_id:
          state.formData.subUnidad_id || state.selectedOT.subUnidad_id,
        tipoEjecucion:
          state.formData.tipoEjecucion ||
          state.selectedOT.tipoEjecucion ||
          'preventivo',
        departamento_id:
          state.formData.departamento_id || state.selectedOT.departamento_id,
        objeto_id: state.formData.objeto_id || state.selectedOT.objeto_id,
        supervisor_id:
          state.formData.supervisor_id || state.selectedOT.supervisor_id,
        descripcionTarea:
          state.formData.descripcionTarea || state.selectedOT.descripcionTarea,
        fechaHora: state.formData.fechaHora || state.selectedOT.fechaHora,
        tipoCambio: state.formData.tipoCambio || state.selectedOT.tipoCambio,
        tiempoEstimado:
          state.formData.tiempoEstimado || state.selectedOT.tiempoEstimado,
        estado: state.formData.estado || state.selectedOT.estado || 'Abierta',
        indicacionesEspeciales:
          state.formData.indicacionesEspeciales ||
          state.selectedOT.indicacionesEspeciales,
        tecnicos: state.formData.tecnicos || state.selectedOT.tecnicos || [],
      };

      console.log('Enviando datos al actualizar OT:', dataToSend);

      const res = await fetch(`${API_BASE_URL}/${state.selectedOT.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
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
    departamentos,
    objetos,
    supervisores,
    subUnidades,
  };
}
