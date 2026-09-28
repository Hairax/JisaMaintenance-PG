import React from 'react';
import { ManagementPage } from '../../../shared/components/management/ManagementPage';
import { FaCogs } from 'react-icons/fa';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { codigoMaquina } from '../../../shared/utils/codigos';
import { exportMaquinasToExcel } from '../functions/exportExcel';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useMaquina } from '../hooks/useMaquina';
import { MaquinaTable } from '../components/maquinaTable';
import { MaquinaModal } from '../components/maquinaModal';

export const MaquinaPage: React.FC = () => {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = React.useState('');
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateMaquina,
    handleUpdateMaquina,
    handleDeleteClick,
    handleDelete,
  } = useMaquina();

  // Adaptador para el input del modal
  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;
    if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    }
    handleInputChange(name, parsedValue);
  };

  const filtrados = filtrarPorTexto(
    state.maquinas,
    busqueda,
    (m) => [m.name, m.fabricante, m.tipoDeMaquina, m.numeroDeSerie],
    {
      codigo: (m) => codigoMaquina(m, state.procesos),
    },
  );

  return (
    <>
      <ManagementPage
        title="Máquinas"
        subtitle="Activos de la planta con su código, fabricante y ubicación."
        icon={<FaCogs />}
        total={state.maquinas.length}
        resultados={filtrados.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        searchPlaceholder="Buscar por código (ej. 1.01.02), nombre, fabricante, tipo o N° de serie..."
        onExport={() =>
          exportMaquinasToExcel(
            state.maquinas,
            state.procesos,
            state.centrosCosto,
            state.proveedores,
          )
        }
        onAdd={() => handleOpenModal('create')}
        addLabel="Nueva máquina"
      >
        <MaquinaTable
          maquinas={filtrados}
          loading={state.loading}
          error={state.error}
          procesos={state.procesos}
          centrosCosto={state.centrosCosto}
          proveedores={state.proveedores}
          onViewMaquina={(maquina) => handleOpenModal('view', maquina)}
        />
      </ManagementPage>
      <MaquinaModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedMaquina={state.selectedMaquina}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        centrosCosto={state.centrosCosto}
        procesos={state.procesos}
        proveedores={state.proveedores}
        onClose={handleCloseModal}
        onInputChange={onInputChange}
        onCreateMaquina={handleCreateMaquina}
        onUpdateMaquina={handleUpdateMaquina}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={() => handleOpenModal('edit', state.selectedMaquina)}
      />
    </>
  );
};
