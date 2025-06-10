import React from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useOt } from '../hooks/useOt';
import { OtTable } from '../components/otTable';
import { OtModal } from '../components/otModal';

export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const OtPage: React.FC = () => {
  const { theme } = useTheme();
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateOt,
    handleUpdateOt,
    handleDeleteClick,
    handleDeleteOt,
    tiposMantenimiento,
    centrosCosto,
    procesos,
    maquinas,
    fetchOts,
  } = useOt();

  // Estilos de la página según el tema
  const pageStyle = {
    backgroundColor: theme === 'dark' ? colors.darkBg : colors.lightBg,
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  return (
    <div style={pageStyle}>
      <OtTable
        ots={state.ots}
        theme={theme}
        onAddOt={() => handleOpenModal('create')}
        onViewOt={(ot) => handleOpenModal('view', ot)}
        loading={state.loading}
        error={state.error}
        tiposMantenimiento={tiposMantenimiento}
        centrosCosto={centrosCosto}
      />

      <OtModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedOT={state.selectedOT}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateOt={handleCreateOt}
        onUpdateOt={handleUpdateOt}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDeleteOt}
        onEditMode={() =>
          state.selectedOT && handleOpenModal('edit', state.selectedOT)
        }
        tiposMantenimiento={tiposMantenimiento}
        centrosCosto={centrosCosto}
        procesos={procesos}
        maquinas={maquinas}
      />
    </div>
  );
};
