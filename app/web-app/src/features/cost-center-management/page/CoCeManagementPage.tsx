import React from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { CoCeTable } from '../components/CoCeTable';
import { useCoCeManagement } from '../hooks/useCoCeManagement';
import { CoCeModal } from '../components/CoCeModal';

export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const CoCeManagement: React.FC = () => {
  const { theme } = useTheme();
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateCostCenter,
    handleUpdateCostCenter,
    handleDeleteClick,
    handleDelete,
  } = useCoCeManagement();

  // Define estilos basados en el tema
  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  return (
    <div style={pageStyle}>
      <CoCeTable
        costCenters={state.costCenters}
        theme={theme}
        onAddCostCenter={() => handleOpenModal('add')}
        onViewCostCenter={(costCenter) => handleOpenModal('view', costCenter)}
        loading={state.loading}
        error={state.error}
      />

      <CoCeModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedCostCenter={state.selectedCostCenter}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateCostCenter={handleCreateCostCenter}
        onUpdateCostCenter={handleUpdateCostCenter}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={() =>
          state.selectedCostCenter &&
          handleOpenModal('edit', state.selectedCostCenter)
        }
      />
    </div>
  );
};
