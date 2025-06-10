import React from 'react';
import { TipoMantenimientoTable } from '../components/tipoMantenimientoTable';
import { TipoMantenimientoModal } from '../components/tipoMantenimientoModal';
import { useTipoMantenimiento } from '../hooks/useTipoMantenimiento';
import { useTheme } from '../../../shared/contexts/ThemeContext'; // <-- Agrega esto

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

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
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const buttonBgColor = colors.gold;
  const buttonHoverColor = '#E69D00';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        minHeight: '100vh',
        padding: '20px 0',
      }}
    >
      <div className="flex justify-between items-center mb-6 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
        <h1 style={{ color: textColor }} className="text-2xl font-bold">
          Tipos de Mantenimiento
        </h1>
        <button
          style={{
            backgroundColor: buttonBgColor,
            color: colors.darkText,
          }}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg shadow transition duration-150 ease-in-out"
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = buttonHoverColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = buttonBgColor)
          }
          onClick={() => handleOpenModal('create')}
        >
          Nuevo Tipo de Mantenimiento
        </button>
      </div>
      <TipoMantenimientoTable
        tiposMantenimiento={state.tiposMantenimiento}
        loading={state.loading}
        error={state.error}
        onView={(tipo) => handleOpenModal('view', tipo)}
        onEdit={(tipo) => handleOpenModal('edit', tipo)}
        onDelete={(tipo) => {
          handleOpenModal('view', tipo);
          handleDeleteClick();
        }}
        theme={theme}
      />
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
    </div>
  );
};
