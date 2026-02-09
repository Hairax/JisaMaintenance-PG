import React from 'react';
import { exportCostCentersToExcel } from '../functions/exportExcel';
import { colors } from '../constants/colors';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useCoCeManagement } from '../hooks/useCoCeManagement';
import { CoCeTable } from '../components/CoCeTable';
import { CoCeModal } from '../components/CoCeModal';
import { CostCenter } from '../../../shared/types/cost-center.types';

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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            onClick={() => exportCostCentersToExcel(state.costCenters)}
            style={{
              backgroundColor: colors.gold,
              color: colors.lightText,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            }}
          >
            Exportar a Excel
          </button>
        </div>
        <CoCeTable
          costCenters={state.costCenters}
          theme={theme}
          onAddCostCenter={() => handleOpenModal('add')}
          onViewCostCenter={(costCenter: CostCenter) => handleOpenModal('view', costCenter)}
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
