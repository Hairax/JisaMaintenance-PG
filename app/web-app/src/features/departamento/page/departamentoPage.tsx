import React from 'react';
import { exportDepartamentoExcel } from '../functions/exportExcel';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { DepartamentoTable } from '../components/departamentoTable';
import { DepartamentoModal } from '../components/departamentoModal';
import { useDepartamento } from '../hooks/useDepartamento';
import { Departamento } from '../types/departamento.types';

export const DepartamentoPage: React.FC = () => {
  const { theme } = useTheme();
  const {
    departamentos,
    loading,
    error,
    selectedDepartamento,
    createDepartamento,
    updateDepartamento,
    deleteDepartamento,
    selectDepartamento,
  } = useDepartamento();

  // Estado para modal y formulario
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'view' | 'edit' | 'add'>(
    'view',
  );
  const [formData, setFormData] = React.useState({ nombre: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteCountdown, setDeleteCountdown] = React.useState(10);
  const [canConfirmDelete, setCanConfirmDelete] = React.useState(false);

  // Abrir modal para agregar
  const handleAddDepartamento = () => {
    setFormData({ nombre: '' });
    setModalMode('add');
    setIsModalOpen(true);
    selectDepartamento(null);
    setShowDeleteConfirm(false);
  };

  // Abrir modal para ver/editar
  const handleViewDepartamento = (departamento: Departamento | null) => {
    selectDepartamento(departamento);
    setFormData({ nombre: departamento ? departamento.nombre : '' });
    setModalMode('view');
    setIsModalOpen(true);
    setShowDeleteConfirm(false);
  };

  // Cambiar a modo edición
  const handleEditMode = () => {
    setModalMode('edit');
    setShowDeleteConfirm(false);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowDeleteConfirm(false);
    setCanConfirmDelete(false);
    setDeleteCountdown(10);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Crear departamento
  const handleCreateDepartamento = async () => {
    await createDepartamento(formData);
    handleCloseModal();
  };

  // Actualizar departamento
  const handleUpdateDepartamento = async () => {
    if (selectedDepartamento) {
      await updateDepartamento(selectedDepartamento.id, formData);
      handleCloseModal();
    }
  };

  // Eliminar departamento (con confirmación)
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setDeleteCountdown(10);
    setCanConfirmDelete(false);

    let countdown = 10;
    const interval = setInterval(() => {
      countdown -= 1;
      setDeleteCountdown(countdown);
      if (countdown <= 0) {
        setCanConfirmDelete(true);
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleDelete = async () => {
    if (selectedDepartamento) {
      await deleteDepartamento(selectedDepartamento.id);
      handleCloseModal();
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Departamentos</h2>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => exportDepartamentoExcel(departamentos)}
        >
          Exportar a Excel
        </button>
      </div>
      <DepartamentoTable
        departamentos={departamentos}
        theme={theme}
        onAddDepartamento={handleAddDepartamento}
        onViewDepartamento={handleViewDepartamento}
        loading={loading}
        error={error}
      />
      <DepartamentoModal
        isOpen={isModalOpen}
        mode={modalMode}
        selectedDepartamento={selectedDepartamento}
        formData={formData}
        theme={theme}
        showDeleteConfirm={showDeleteConfirm}
        deleteCountdown={deleteCountdown}
        canConfirmDelete={canConfirmDelete}
        loading={loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateDepartamento={handleCreateDepartamento}
        onUpdateDepartamento={handleUpdateDepartamento}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={handleEditMode}
      />
    </div>
  );
};
