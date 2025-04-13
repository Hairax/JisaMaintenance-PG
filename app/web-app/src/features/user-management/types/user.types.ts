import { User } from '../../../shared/types/user.types';

export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  password?: string;
};

export type ModalMode = 'view' | 'add' | 'edit';

export interface UserManagementState {
  users: User[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedUser: User | null;
  formData: Partial<UserFormData>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
}
