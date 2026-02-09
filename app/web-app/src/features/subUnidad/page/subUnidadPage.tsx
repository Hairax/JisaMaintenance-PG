import React from 'react';
import { exportSubUnidadesToExcel } from '../functions/exportExcel';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useSubUnidad } from '../hooks/useSubUnidad';
import { SubUnidadTable } from '../components/subUnidadTable';
import { SubUnidadModal } from '../components/subUnidadModal';

import { colors } from '../types/colors';

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
      <div className="flex justify-end p-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow"
          onClick={() => exportSubUnidadesToExcel(state.subUnidades)}
        >
          Exportar a Excel
        </button>
      </div>
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
