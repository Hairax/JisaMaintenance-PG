export interface OrdenTrabajo {
  id: number;
  tipoOT_id?: number;
  centroCosto_id?: number;
  proceso_id?: number;
  maquina_id?: number;
  subUnidad_id?: number;
  departamento_id?: number;
  objeto_id?: number;
  supervisor_id?: number;
  tipoOT?: {
    id: number;
    nombre: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  centroCosto?: {
    id: number;
    nombre: string;
  };
  proceso?: {
    id: number;
    nombre: string;
  };
  maquina?: {
    id: number;
    nombre: string;
  };
  subUnidad?: {
    id: number;
    nombre: string;
  } | null;
  tipoEjecucion?: string;
  departamento?: {
    id: number;
    nombre: string;
  };
  objeto?: {
    id: number;
    nombre: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  tiempoEstimado?: number;
  supervisor?: {
    id: number;
    nombre: string;
  };
  descripcionTarea?: string;
  fechaHora?: string | Date;
  tipoCambio?: number;
  estado?: string;
  fechaCreacion?: string | Date;
}

export type OrdenTrabajoFormData = Partial<
  Omit<
    OrdenTrabajo,
    | 'id'
    | 'supervisor'
    | 'tipoOT'
    | 'centroCosto'
    | 'proceso'
    | 'maquina'
    | 'subUnidad'
    | 'departamento'
    | 'objeto'
  >
> & {
  tipoOT_id?: number;
  centroCosto_id?: number;
  proceso_id?: number;
  maquina_id?: number;
  subUnidad_id?: number;
  departamento_id?: number;
  objeto_id?: number;
  supervisor_id?: number;
};

export type ModalMode = 'view' | 'edit' | 'create';

export interface OTManagementState {
  ots: OrdenTrabajo[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedOT: OrdenTrabajo | null;
  formData: Partial<OrdenTrabajoFormData>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
}
