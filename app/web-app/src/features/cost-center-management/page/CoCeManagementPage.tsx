import React from 'react';
import { ManagementPage } from '../../../shared/components/management/ManagementPage';
import { FaCoins } from 'react-icons/fa';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { exportCostCentersToExcel } from '../functions/exportExcel';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useCoCeManagement } from '../hooks/useCoCeManagement';
import { CoCeTable } from '../components/CoCeTable';
import { CoCeModal } from '../components/CoCeModal';
import { CostCenter } from '../../../shared/types/cost-center.types';

export const CoCeManagement: React.FC = () => {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = React.useState('');
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

  const filtrados = filtrarPorTexto(state.costCenters, busqueda, (c) => [
    c.name,
  ]);

  return (
    <>
      <ManagementPage
        title="Centros de Costo"
        subtitle="Áreas a las que se imputan los costos de mantenimiento."
        icon={<FaCoins />}
        total={state.costCenters.length}
        resultados={filtrados.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        searchPlaceholder="Buscar por ID o nombre..."
        onExport={() => exportCostCentersToExcel(state.costCenters)}
        onAdd={() => handleOpenModal('add')}
        addLabel="Nuevo centro de costo"
      >
        <CoCeTable
          costCenters={filtrados}
          onViewCostCenter={(costCenter: CostCenter) =>
            handleOpenModal('view', costCenter)
          }
          loading={state.loading}
          error={state.error}
        />
      </ManagementPage>
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
    </>
  );
};
