import React from 'react';
import { exportProcessToExcel } from '../functions/exportExcel';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useProcess } from '../hooks/useProcess';
import { ProcessTable } from '../components/processTable';
import { ProcessModal } from '../components/processModal';

export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const ProcessPage: React.FC = () => {
  const { theme } = useTheme();
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateProcess,
    handleUpdateProcess,
    handleDeleteClick,
    handleDelete,
  } = useProcess();

  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  const handleExportExcel = () => {
    exportProcessToExcel(state.processes);
  };

  return (
    <div style={pageStyle}>
      <button
        onClick={handleExportExcel}
        style={{
          marginBottom: '16px',
          padding: '8px 16px',
          backgroundColor: colors.gold,
          color: colors.darkText,
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Exportar a Excel
      </button>

      <ProcessTable
        processes={state.processes}
        theme={theme}
        onAddProcess={() => handleOpenModal('add')}
        onViewProcess={(process) => handleOpenModal('view', process)}
        loading={state.loading}
        error={state.error}
      />

      <ProcessModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedProcess={state.selectedProcess}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateProcess={handleCreateProcess}
        onUpdateProcess={handleUpdateProcess}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={() =>
          state.selectedProcess &&
          handleOpenModal('edit', state.selectedProcess)
        }
      />
    </div>
  );
};
