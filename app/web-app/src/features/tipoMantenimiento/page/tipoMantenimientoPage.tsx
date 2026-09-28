import React from 'react';
import { ManagementPage } from '../../../shared/components/management/ManagementPage';
import { FaTools } from 'react-icons/fa';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { TipoMantenimientoTable } from '../components/tipoMantenimientoTable';
import { TipoMantenimientoModal } from '../components/tipoMantenimientoModal';
import { useTipoMantenimiento } from '../hooks/useTipoMantenimiento';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { exportTipoMantenimientoToExcel } from '../functions/exportExcel';

export const TipoMantenimientoPage: React.FC = () => {
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateTipoMantenimiento,
    handleUpdateTipoMantenimiento,
    handleDeleteClick,
    handleDeleteTipoMantenimiento,
  } = useTipoMantenimiento();

  const { theme } = useTheme();
  const [busqueda, setBusqueda] = React.useState('');

  const filtrados = filtrarPorTexto(state.tiposMantenimiento, busqueda, (t) => [
    t.nombre,
  ]);

  return (
    <>
      <ManagementPage
        title="Tipos de Mantenimiento"
        subtitle="Clasificación de las órdenes de trabajo (preventivo, correctivo...)."
        icon={<FaTools />}
        total={state.tiposMantenimiento.length}
        resultados={filtrados.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        searchPlaceholder="Buscar por ID o nombre..."
        onExport={() =>
          exportTipoMantenimientoToExcel(state.tiposMantenimiento)
        }
        onAdd={() => handleOpenModal('create')}
        addLabel="Nuevo tipo"
      >
        <TipoMantenimientoTable
          tiposMantenimiento={filtrados}
          loading={state.loading}
          error={state.error}
          onView={(tipo) => handleOpenModal('view', tipo)}
        />
      </ManagementPage>
      <TipoMantenimientoModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedTipoMantenimiento={state.selectedTipoMantenimiento}
        formData={state.formData}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreate={handleCreateTipoMantenimiento}
        onUpdate={handleUpdateTipoMantenimiento}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDeleteTipoMantenimiento}
        onEditMode={() =>
          state.selectedTipoMantenimiento &&
          handleOpenModal('edit', state.selectedTipoMantenimiento)
        }
        theme={theme}
      />
    </>
  );
};
