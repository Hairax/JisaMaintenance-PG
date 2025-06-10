export interface Maquina {
  id: number;
  name: string;
  fabricante: string;
  tipoDeMaquina: string;
  numeroDeSerie: string;
  fechaDeFabricacion: string; // ISO string para fechas
  fechaDeMontaje: string;
  costo: number;
  horasTrabajadas: number;
  centroCosto_id: number;
  proceso_id: number;
  proveedor_id: number;
  createdAt: string;
  updatedAt: string;
}

export type MaquinaFormData = Omit<
  Maquina,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ModalMode = 'view' | 'edit' | 'create';

export interface MaquinaManagementState {
  maquinas: Maquina[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedMaquina: Maquina | null;
  formData: Partial<MaquinaFormData>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
}
