import React from 'react';
import { SearchBar } from '../../../shared/components/SearchBar';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { ROLE_LABELS } from '../../../shared/permissions/permissions';
import { exportUsersToExcel } from '../functions/exportExcel';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { UserTable } from '../components/UserTable';
import { UserModal } from '../components/UserModal';
import { useUserManagement } from '../hooks/useUserManagement';

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
  const [busqueda, setBusqueda] = React.useState('');
  const { can } = usePermissions();
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteClick,
    handleDelete,
    handleChangePassword,
  } = useUserManagement();

  // Define estilos basados en el tema
  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  const filtrados = filtrarPorTexto(state.users, busqueda, (u) => [
    u.name,
    u.lastName,
    u.userName,
    u.email,
    u.cargo,
    ROLE_LABELS[u.cargo],
  ]);

  return (
    <div style={pageStyle}>
      <button
        style={{
          marginBottom: '16px',
          padding: '8px 16px',
          backgroundColor: colors.gold,
          color: colors.darkText,
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => exportUsersToExcel(state.users)}
      >
        Exportar a Excel
      </button>

      <SearchBar
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por ID, nombre, usuario, email o cargo..."
        theme={theme}
        total={state.users.length}
        resultados={filtrados.length}
      />

      <UserTable
        users={filtrados}
        theme={theme}
        onAddUser={() => handleOpenModal('add')}
        onViewUser={(user) => handleOpenModal('view', user)}
        loading={state.loading}
        error={state.error}
        canCreate={can('crearUsuarios')}
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
        canEdit={can('editarUsuarios')}
        canDelete={can('eliminarUsuarios')}
        canChangePassword={can('cambiarContrasenas')}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
};
