import React from 'react';
import { SearchBar } from '../../../shared/components/SearchBar';
import { filtrarPorTexto } from '../../../shared/utils/search';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useProveedores } from '../hooks/useProveedores';
import { ProveedoresTable } from '../components/proovedoresTable';
import { ProveedoresModal } from '../components/proovedoresModal';
import { exportProveedoresToExcel } from '../functions/exportExcel';

export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const ProovedoresPage: React.FC = () => {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = React.useState('');
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateProveedor,
    handleUpdateProveedor,
    handleDeleteClick,
    handleDelete,
  } = useProveedores();

  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  const filtrados = filtrarPorTexto(state.proveedores, busqueda, (p) => [
    p.nombre,
    p.ruc,
    p.correoElectronico,
    p.telefono,
    p.direccion,
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
          onClick={() => exportProveedoresToExcel(state.proveedores)}
          style={{
            backgroundColor: colors.gold,
            color: colors.darkText,
            padding: '8px 16px',
            borderRadius: 8,
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            border: 'none',
            cursor: 'pointer',
            marginRight: 16,
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = '#E69D00')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = colors.gold)
          }
        >
          Exportar a Excel
        </button>
      </div>
      <SearchBar
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por ID, nombre, NIT, correo o teléfono..."
        theme={theme}
        total={state.proveedores.length}
        resultados={filtrados.length}
      />
      <ProveedoresTable
        proveedores={filtrados}
        theme={theme}
        onAddProveedor={() => handleOpenModal('create')}
        onViewProveedor={(proveedor) => handleOpenModal('view', proveedor)}
        loading={state.loading}
        error={state.error}
      />

      <ProveedoresModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedProveedor={state.selectedProveedor}
        formData={state.formData}
        theme={theme}
        showDeleteConfirm={state.showDeleteConfirm}
        deleteCountdown={state.deleteCountdown}
        canConfirmDelete={state.canConfirmDelete}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateProveedor={handleCreateProveedor}
        onUpdateProveedor={handleUpdateProveedor}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={() => handleOpenModal('edit', state.selectedProveedor)}
      />
    </div>
  );
};
