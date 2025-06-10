export interface Objeto {
  id: number;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ObjetoFormData = Omit<Objeto, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ModalMode = 'view' | 'edit' | 'add';

export interface ObjetoManagementState {
  objetos: Objeto[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedObjeto: Objeto | null;
  formData: Partial<ObjetoFormData>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
}
