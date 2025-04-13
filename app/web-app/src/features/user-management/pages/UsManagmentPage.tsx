import React from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { UserTable } from '../components/UserTable';
import { UserModal } from '../components/UserModal';
import { useUserManagement } from '../hooks/useUserManagement';

// Paleta de colores
export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const UserManagementPage: React.FC = () => {
  const { theme } = useTheme();
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteClick,
    handleDelete,
  } = useUserManagement();

  // Define estilos basados en el tema
  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  return (
    <div style={pageStyle}>
      <UserTable
        users={state.users}
        theme={theme}
        onAddUser={() => handleOpenModal('add')}
        onViewUser={(user) => handleOpenModal('view', user)}
        loading={state.loading}
        error={state.error}
      />

      <UserModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedUser={state.selectedUser}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateUser={handleCreateUser}
        onUpdateUser={handleUpdateUser}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={() =>
          state.selectedUser && handleOpenModal('edit', state.selectedUser)
        }
      />
    </div>
  );
};
