import React from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useSubUnidad } from '../hooks/useSubUnidad';
import { SubUnidadTable } from '../components/subUnidadTable';
import { SubUnidadModal } from '../components/subUnidadModal';

export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const SubUnidadPage: React.FC = () => {
  const { theme } = useTheme();
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateSubUnidad,
    handleUpdateSubUnidad,
    handleDeleteClick,
    handleDeleteSubUnidad,
  } = useSubUnidad();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: theme === 'dark' ? colors.darkBg : colors.lightBg,
        color: theme === 'dark' ? colors.lightText : colors.darkText,
      }}
    >
      <SubUnidadTable
        subUnidades={state.subUnidades}
        theme={theme}
        onAddSubUnidad={() => handleOpenModal('create')}
        onViewSubUnidad={(subUnidad) => handleOpenModal('view', subUnidad)}
        loading={state.loading}
        error={state.error}
      />

      <SubUnidadModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedSubUnidad={state.selectedSubUnidad}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateSubUnidad={handleCreateSubUnidad}
        onUpdateSubUnidad={handleUpdateSubUnidad}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDeleteSubUnidad}
        onEditMode={() => handleOpenModal('edit', state.selectedSubUnidad!)}
      />
    </div>
  );
};
