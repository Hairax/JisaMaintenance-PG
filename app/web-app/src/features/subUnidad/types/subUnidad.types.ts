export interface SubUnidad {
  id: number;
  descripcion: string;
  maquina_id: number;
  correlativo?: number;
  createdAt: string; // Usualmente los dates llegan como string ISO desde el backend
  updatedAt: string;
}

export type SubUnidadFormData = Omit<
  SubUnidad,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  centroCosto_id?: number;
  proceso_id?: number;
};

export type ModalMode = 'view' | 'edit' | 'create';

export interface SubUnidadManagementState {
  subUnidades: SubUnidad[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedSubUnidad: SubUnidad | null;
  formData: Partial<SubUnidadFormData>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
}
