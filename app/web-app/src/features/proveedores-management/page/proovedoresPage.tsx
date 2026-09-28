import React from 'react';
import { ManagementPage } from '../../../shared/components/management/ManagementPage';
import { FaTruck } from 'react-icons/fa';
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

  const filtrados = filtrarPorTexto(state.proveedores, busqueda, (p) => [
    p.nombre,
    p.ruc,
    p.correoElectronico,
    p.telefono,
    p.direccion,
  ]);

  return (
    <>
      <ManagementPage
        title="Proveedores"
        subtitle="Empresas que suministran repuestos, equipos y servicios."
        icon={<FaTruck />}
        total={state.proveedores.length}
        resultados={filtrados.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        searchPlaceholder="Buscar por ID, nombre, NIT, correo o teléfono..."
        onExport={() => exportProveedoresToExcel(state.proveedores)}
        onAdd={() => handleOpenModal('create')}
        addLabel="Nuevo proveedor"
      >
        <ProveedoresTable
          proveedores={filtrados}
          onViewProveedor={(proveedor) => handleOpenModal('view', proveedor)}
          loading={state.loading}
          error={state.error}
        />
      </ManagementPage>
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
    </>
  );
};
