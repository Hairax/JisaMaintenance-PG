import React from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useProveedores } from '../hooks/useProveedores';
import { ProveedoresTable } from '../components/proovedoresTable';
import { ProveedoresModal } from '../components/proovedoresModal';

export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const ProovedoresPage: React.FC = () => {
  const { theme } = useTheme();
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateProveedor,
    handleUpdateProveedor,
    handleDeleteClick,
    handleDelete,
  } = useProveedores();

  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  return (
    <div style={pageStyle}>
      <ProveedoresTable
        proveedores={state.proveedores}
        theme={theme}
        onAddProveedor={() => handleOpenModal('create')}
        onViewProveedor={(proveedor) => handleOpenModal('view', proveedor)}
        loading={state.loading}
        error={state.error}
      />

      <ProveedoresModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedProveedor={state.selectedProveedor}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateProveedor={handleCreateProveedor}
        onUpdateProveedor={handleUpdateProveedor}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={() => handleOpenModal('edit', state.selectedProveedor)}
      />
    </div>
  );
};
