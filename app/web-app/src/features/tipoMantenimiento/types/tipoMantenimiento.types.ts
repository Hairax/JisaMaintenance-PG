export interface TipoMantenimiento {
  id: number;
  nombre: string;
  createdAt: string; // o Date, según cómo lo manejes en el frontend
  updatedAt: string; // o Date
}

export type TipoMantenimientoFormData = Omit<
  TipoMantenimiento,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ModalMode = 'view' | 'edit' | 'create';

export interface TipoMantenimientoManagementState {
  tiposMantenimiento: TipoMantenimiento[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedTipoMantenimiento: TipoMantenimiento | null;
  formData: Partial<TipoMantenimientoFormData>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
}
