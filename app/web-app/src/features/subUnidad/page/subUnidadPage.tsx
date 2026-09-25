import React from 'react';
import { SearchBar } from '../../../shared/components/SearchBar';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { exportSubUnidadesToExcel } from '../functions/exportExcel';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useSubUnidad } from '../hooks/useSubUnidad';
import { SubUnidadTable } from '../components/subUnidadTable';
import { SubUnidadModal } from '../components/subUnidadModal';

import { colors } from '../types/colors';

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

  const filtrados = filtrarPorTexto(state.subUnidades, busqueda, (s) => [
    s.descripcion,
    state.maquinas.find((m) => m.id === s.maquina_id)?.name,
  ]);

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
          onClick={() =>
            exportSubUnidadesToExcel(
              state.subUnidades,
              state.procesos,
              state.maquinas,
              state.centrosCosto,
            )
          }
        >
          Exportar a Excel
        </button>
      </div>
      <SearchBar
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por ID, descripción o máquina..."
        theme={theme}
        total={state.subUnidades.length}
        resultados={filtrados.length}
      />
      <SubUnidadTable
        subUnidades={filtrados}
        theme={theme}
        maquinas={state.maquinas}
        procesos={state.procesos}
        centrosCosto={state.centrosCosto}
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
    </div>
  );
};
