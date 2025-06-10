import React, { useState } from 'react';
import { useRepuesto } from '../hooks/useRepuesto';
import { RepuestoTable } from '../components/repuestoTable';
import { RepuestoModal, ModalMode } from '../components/repuestoModal';
import { CreateRepuestoDto } from '../types/repuesto.types';
import { useTheme } from '../../../shared/contexts/ThemeContext';

export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const RepuestoPage: React.FC = () => {
  const {
    repuestos,
    loading,
    error,
    selectedRepuesto,
    fetchRepuestos,
    createRepuesto,
    updateRepuesto,
    deleteRepuesto,
    selectRepuesto,
  } = useRepuesto();
  const { theme } = useTheme();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [formData, setFormData] = useState<Partial<CreateRepuestoDto>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(3);
  const [canConfirmDelete, setCanConfirmDelete] = useState(false);

  // Abrir modal para agregar
  const handleAddRepuesto = () => {
    setFormData({});
    setModalMode('add');
    setModalOpen(true);
    setShowDeleteConfirm(false);
    selectRepuesto(null);
  };

  // Abrir modal para ver
  const handleViewRepuesto = (repuesto: any) => {
    selectRepuesto(repuesto);
    setFormData(repuesto);
    setModalMode('view');
    setModalOpen(true);
    setShowDeleteConfirm(false);
  };

  // Cambiar a modo edición
  const handleEditMode = () => {
    setModalMode('edit');
    setShowDeleteConfirm(false);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setShowDeleteConfirm(false);
    setCanConfirmDelete(false);
    setDeleteCountdown(3);
    selectRepuesto(null);
    setFormData({});
  };

  // Manejar cambios en el formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  // Crear repuesto
  const handleCreateRepuesto = async () => {
    await createRepuesto(formData as CreateRepuestoDto);
    handleCloseModal();
  };

  // Actualizar repuesto
  const handleUpdateRepuesto = async () => {
    if (selectedRepuesto) {
      await updateRepuesto(selectedRepuesto.id, formData);
      handleCloseModal();
    }
  };

  // Eliminar repuesto (con confirmación)
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setDeleteCountdown(3);
    setCanConfirmDelete(false);
    let countdown = 3;
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
    if (selectedRepuesto) {
      await deleteRepuesto(selectedRepuesto.id);
      handleCloseModal();
    }
  };

  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    minHeight: '100vh',
    padding: '20px 0',
  };

  return (
    <div style={pageStyle}>
      <RepuestoTable
        repuestos={repuestos}
        theme={theme}
        onAddRepuesto={handleAddRepuesto}
        onViewRepuesto={handleViewRepuesto}
        loading={loading}
        error={error}
      />

      <RepuestoModal
        isOpen={modalOpen}
        mode={modalMode}
        selectedRepuesto={selectedRepuesto}
        formData={formData}
        theme={theme}
        showDeleteConfirm={showDeleteConfirm}
        deleteCountdown={deleteCountdown}
        canConfirmDelete={canConfirmDelete}
        loading={loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateRepuesto={handleCreateRepuesto}
        onUpdateRepuesto={handleUpdateRepuesto}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={handleEditMode}
      />
    </div>
  );
};
