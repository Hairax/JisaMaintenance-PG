import React from 'react';
import { ManagementPage } from '../../../shared/components/management/ManagementPage';
import { FaPuzzlePiece } from 'react-icons/fa';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { codigoSubUnidad } from '../../../shared/utils/codigos';
import { exportSubUnidadesToExcel } from '../functions/exportExcel';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useSubUnidad } from '../hooks/useSubUnidad';
import { SubUnidadTable } from '../components/subUnidadTable';
import { SubUnidadModal } from '../components/subUnidadModal';

export const SubUnidadPage: React.FC = () => {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = React.useState('');
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

  const filtrados = filtrarPorTexto(
    state.subUnidades,
    busqueda,
    (s) => [
      s.descripcion,
      state.maquinas.find((m) => m.id === s.maquina_id)?.name,
    ],
    {
      codigo: (s) => codigoSubUnidad(s, state.maquinas, state.procesos),
    },
  );

  return (
    <>
      <ManagementPage
        title="Subunidades"
        subtitle="Componentes o secciones de cada máquina."
        icon={<FaPuzzlePiece />}
        total={state.subUnidades.length}
        resultados={filtrados.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        searchPlaceholder="Buscar por código (ej. 1.01.02.01), descripción o máquina..."
        onExport={() =>
          exportSubUnidadesToExcel(
            state.subUnidades,
            state.procesos,
            state.maquinas,
            state.centrosCosto,
          )
        }
        onAdd={() => handleOpenModal('create')}
        addLabel="Nueva subunidad"
      >
        <SubUnidadTable
          subUnidades={filtrados}
          maquinas={state.maquinas}
          procesos={state.procesos}
          onViewSubUnidad={(subUnidad) => handleOpenModal('view', subUnidad)}
          loading={state.loading}
          error={state.error}
        />
      </ManagementPage>
      <SubUnidadModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedSubUnidad={state.selectedSubUnidad}
        formData={state.formData}
        theme={theme}
        centrosCosto={state.centrosCosto}
        procesos={state.procesos}
        maquinas={state.maquinas}
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
    </>
  );
};
