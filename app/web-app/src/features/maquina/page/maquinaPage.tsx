import React from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useMaquina } from '../hooks/useMaquina';
import { MaquinaTable } from '../components/maquinaTable';
import { MaquinaModal } from '../components/maquinaModal';

export const MaquinaPage: React.FC = () => {
  const colors = {
    brown: '#9E5533',
    beige: '#E1CD9B',
    gold: '#FBAF11',
    darkBg: '#1A1A1A',
    lightBg: '#E6E6E6',
    darkText: '#000000',
    lightText: '#FFFFFF',
  };
  const { theme } = useTheme();
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

  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };
  return (
    <div style={pageStyle}>
      <MaquinaTable
        maquinas={state.maquinas}
        theme={theme}
        loading={state.loading}
        error={state.error}
        onAddMaquina={() => handleOpenModal('create')}
        onViewMaquina={(maquina) => handleOpenModal('view', maquina)}
      />

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
        onClose={handleCloseModal}
        onInputChange={onInputChange}
        onCreateMaquina={handleCreateMaquina}
        onUpdateMaquina={handleUpdateMaquina}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={() => handleOpenModal('edit', state.selectedMaquina)}
      />
    </div>
  );
};
