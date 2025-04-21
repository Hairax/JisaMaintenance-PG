import { Proveedor } from '../../../shared/types/proveedor.types';

export type ProveedorFormData = Omit<
  Proveedor,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  nombre?: string;
  telefono?: string;
  ruc?: string;
  correoElectronico?: string;
  direccion?: string;
};

export type ModalMode = 'view' | 'edit' | 'create';

export interface ProveedorManagementState {
  proveedores: Proveedor[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedProveedor: Proveedor | null;
  formData: Partial<ProveedorFormData>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
}
