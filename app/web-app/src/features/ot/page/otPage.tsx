import React from 'react';
import { SearchBar } from '../../../shared/components/SearchBar';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useOt } from '../hooks/useOt';
import { exportOtsToExcel } from '../functions/exportExcel';
import { OtTable } from '../components/otTable';
import { OtModal } from '../components/otModal';

export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const OtPage: React.FC = () => {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = React.useState('');
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateOt,
    handleUpdateOt,
    handleDeleteClick,
    handleDeleteOt,
    tiposMantenimiento,
    centrosCosto,
    procesos,
    maquinas,
    tecnicos,
    departamentos,
    objetos,
    supervisores,
    subUnidades,
  } = useOt();

  // Estilos de la página según el tema
  const pageStyle = {
    backgroundColor: theme === 'dark' ? colors.darkBg : colors.lightBg,
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  const filtrados = filtrarPorTexto(state.ots, busqueda, (o) => [
    o.descripcionTarea,
    o.indicacionesEspeciales,
    o.maquina?.name ?? o.maquina?.nombre,
    o.tipoOT?.nombre,
    o.costCenter?.name ?? o.centroCosto?.nombre,
    o.proceso?.name ?? o.proceso?.nombre,
    o.departamento?.nombre,
    o.objeto?.nombre,
    o.tipoEjecucion,
    o.estado,
  ]);

  return (
    <div style={pageStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => exportOtsToExcel(state.ots)}
          style={{
            padding: '8px 16px',
            backgroundColor: colors.gold,
            color: colors.darkText,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Exportar a Excel
        </button>
      </div>
      <SearchBar
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por N° de OT, descripción, máquina, tipo, centro de costo, estado..."
        theme={theme}
        total={state.ots.length}
        resultados={filtrados.length}
      />
      <OtTable
        ots={filtrados}
        theme={theme}
        onAddOt={() => handleOpenModal('create')}
        onViewOt={(ot) => handleOpenModal('view', ot)}
        loading={state.loading}
        error={state.error}
        tiposMantenimiento={tiposMantenimiento}
        centrosCosto={centrosCosto}
      />

      <OtModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedOT={state.selectedOT}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateOt={handleCreateOt}
        onUpdateOt={handleUpdateOt}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDeleteOt}
        onEditMode={() =>
          state.selectedOT && handleOpenModal('edit', state.selectedOT)
        }
        tiposMantenimiento={tiposMantenimiento}
        centrosCosto={centrosCosto}
        procesos={procesos}
        maquinas={maquinas}
        tecnicos={tecnicos}
        departamentos={departamentos}
        objetos={objetos}
        supervisores={supervisores}
        subUnidades={subUnidades}
      />
    </div>
  );
};
