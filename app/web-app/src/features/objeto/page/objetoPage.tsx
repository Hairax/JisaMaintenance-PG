import React from 'react';
import { ManagementPage } from '../../../shared/components/management/ManagementPage';
import { FaCube } from 'react-icons/fa';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useObjeto } from '../hooks/useObjeto';
import { exportExcel } from '../functions/exportExcel';
import { ObjetoTable } from '../components/objetoTable';
import { ObjetoModal } from '../components/objetoModal';

export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const ObjetoPage: React.FC = () => {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = React.useState('');
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateObjeto,
    handleUpdateObjeto,
    handleDeleteClick,
    handleDeleteObjeto,
  } = useObjeto();

  const filtrados = filtrarPorTexto(state.objetos, busqueda, (o) => [o.nombre]);

  return (
    <>
      <ManagementPage
        title="Objetos"
        subtitle="Tipos de objeto sobre los que se ejecuta una orden de trabajo."
        icon={<FaCube />}
        total={state.objetos.length}
        resultados={filtrados.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        searchPlaceholder="Buscar por ID o nombre..."
        onExport={() => exportExcel(state.objetos)}
        onAdd={() => handleOpenModal('add')}
        addLabel="Nuevo objeto"
      >
        <ObjetoTable
          objetos={filtrados}
          onViewObjeto={(objeto) => handleOpenModal('view', objeto)}
          loading={state.loading}
          error={state.error}
        />
      </ManagementPage>
      <ObjetoModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedObjeto={state.selectedObjeto}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateObjeto={handleCreateObjeto}
        onUpdateObjeto={handleUpdateObjeto}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDeleteObjeto}
        onEditMode={() => handleOpenModal('edit', state.selectedObjeto)}
      />
    </>
  );
};
