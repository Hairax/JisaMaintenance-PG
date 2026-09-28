import React from 'react';
import { ManagementPage } from '../../../shared/components/management/ManagementPage';
import { FaProjectDiagram } from 'react-icons/fa';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { codigoProceso } from '../../../shared/utils/codigos';
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
  const [busqueda, setBusqueda] = React.useState('');
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

  const handleExportExcel = () => {
    exportProcessToExcel(state.processes);
  };

  const filtrados = filtrarPorTexto(
    state.processes,
    busqueda,
    (p) => [
      p.name,
      state.costCenters.find((c) => c.id === p.centroCosto)?.name,
    ],
    {
      codigo: (p) => codigoProceso(p),
    },
  );

  return (
    <>
      <ManagementPage
        title="Procesos"
        subtitle="Procesos productivos de cada centro de costo."
        icon={<FaProjectDiagram />}
        total={state.processes.length}
        resultados={filtrados.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        searchPlaceholder="Buscar por código (ej. 1.01), nombre o centro de costo..."
        onExport={handleExportExcel}
        onAdd={() => handleOpenModal('add')}
        addLabel="Nuevo proceso"
      >
        <ProcessTable
          processes={filtrados}
          centrosCosto={state.costCenters}
          onViewProcess={(process) => handleOpenModal('view', process)}
          loading={state.loading}
          error={state.error}
        />
      </ManagementPage>
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
        costCenters={state.costCenters}
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
    </>
  );
};
