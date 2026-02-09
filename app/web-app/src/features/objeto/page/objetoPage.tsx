import React from 'react';
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

  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={() => exportExcel(state.objetos)}
          style={{
            background: colors.gold,
            color: colors.darkText,
            border: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Exportar a Excel
        </button>
      </div>
      <ObjetoTable
        objetos={state.objetos}
        theme={theme}
        onAddObjeto={() => handleOpenModal('add')}
        onViewObjeto={(objeto) => handleOpenModal('view', objeto)}
        loading={state.loading}
        error={state.error}
      />

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
    </div>
  );
};
