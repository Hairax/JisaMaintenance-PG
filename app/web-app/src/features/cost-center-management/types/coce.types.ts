import { CostCenter } from '../../../shared/types/cost-center.types';

export type CostCenterFormData = Omit<
  CostCenter,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ModalMode = 'view' | 'add' | 'edit';

export interface CostCenterManagementState {
  costCenters: CostCenter[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedCostCenter: CostCenter | null;
  formData: Partial<CostCenterFormData>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
}
