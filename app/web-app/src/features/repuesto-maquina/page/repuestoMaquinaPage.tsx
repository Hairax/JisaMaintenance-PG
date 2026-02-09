import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useRepuestoMaquina } from '../hooks/useRepuestoMaquina';
import {
  RepuestoMaquina,
  CreateRepuestoMaquinaDto,
  UpdateRepuestoMaquinaDto,
} from '../types/repuestoMaquina.types';
import { RepuestoMaquinaTable } from '../components/repuestoMaquinaTable';
import { RepuestoMaquinaModal } from '../components/repuestoMaquinaModal';
import { exportRepuestosToExcel } from '../functions/exportExcel';

// Paleta de colores igual que user-management
export const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const RepuestoMaquinaPage: React.FC = () => {
  const { theme } = useTheme(); // <-- Usa el hook

  const {
    repuestos,
    loading,
    error,
    selectedRepuesto,
    createRepuesto,
    updateRepuesto,
    deleteRepuesto,
    selectRepuesto,
  } = useRepuestoMaquina();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('view');
  const [formData, setFormData] = useState<
    Partial<CreateRepuestoMaquinaDto & UpdateRepuestoMaquinaDto>
  >({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(3);
  const [canConfirmDelete, setCanConfirmDelete] = useState(false);

  // Reset form data when modal opens/closes or mode changes
  useEffect(() => {
    if (modalOpen) {
      if (modalMode === 'add') {
        setFormData({});
      } else if (selectedRepuesto) {
        setFormData({
          nombre: selectedRepuesto.nombre,
          cantidad: selectedRepuesto.cantidad,
          costoUnitario: selectedRepuesto.costoUnitario,
          descripcion: selectedRepuesto.descripcion,
          maquina_id: selectedRepuesto.maquina_id,
          subUnidad: selectedRepuesto.subUnidad_id ?? undefined,
        });
      }
    } else {
      setShowDeleteConfirm(false);
      setCanConfirmDelete(false);
      setDeleteCountdown(3);
    }
  }, [modalOpen, modalMode, selectedRepuesto]);

  // Delete countdown logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showDeleteConfirm && deleteCountdown > 0) {
      timer = setTimeout(() => setDeleteCountdown((c) => c - 1), 1000);
    } else if (showDeleteConfirm && deleteCountdown === 0) {
      setCanConfirmDelete(true);
    }
    return () => clearTimeout(timer);
  }, [showDeleteConfirm, deleteCountdown]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleAdd = () => {
    setModalMode('add');
    setModalOpen(true);
    selectRepuesto(null);
  };

  const handleView = (repuesto: RepuestoMaquina) => {
    selectRepuesto(repuesto);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditMode = () => {
    setModalMode('edit');
    setShowDeleteConfirm(false);
    setCanConfirmDelete(false);
    setDeleteCountdown(3);
  };

  const handleCreate = async () => {
    await createRepuesto(formData as CreateRepuestoMaquinaDto);
    setModalOpen(false);
  };

  const handleUpdate = async () => {
    if (selectedRepuesto) {
      await updateRepuesto(
        selectedRepuesto.id,
        formData as UpdateRepuestoMaquinaDto,
      );
      setModalOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setDeleteCountdown(3);
    setCanConfirmDelete(false);
  };

  const handleDelete = async () => {
    if (selectedRepuesto) {
      await deleteRepuesto(selectedRepuesto.id);
      setModalOpen(false);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setShowDeleteConfirm(false);
    setCanConfirmDelete(false);
    setDeleteCountdown(3);
    selectRepuesto(null);
  };

  const pageStyle = {
    color: theme === 'dark' ? colors.lightText : colors.darkText,
    backgroundColor: theme === 'dark' ? colors.darkBg : colors.lightBg,
    minHeight: '100vh',
    padding: '20px 0',
  };

  return (
    <div style={pageStyle} className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Repuestos de Máquina</h1>
        <div className="flex gap-4">
          <button
            onClick={handleAdd}
            style={{
              backgroundColor: colors.gold,
              color: colors.darkText,
            }}
            className="px-4 py-2 rounded shadow hover:bg-yellow-500 transition"
          >
            Agregar Repuesto
          </button>
          <button
            onClick={() => exportRepuestosToExcel(repuestos)}
            style={{
              backgroundColor: colors.brown,
              color: colors.lightText,
            }}
            className="px-4 py-2 rounded shadow hover:bg-orange-700 transition"
          >
            Exportar a Excel
          </button>
        </div>
      </div>
      {error && (
        <div
          className="mb-4 px-4 py-2 rounded"
          style={{
            color: '#842029',
            backgroundColor: '#F8D7DA',
          }}
        >
          {error}
        </div>
      )}
      <RepuestoMaquinaTable
        repuestos={repuestos}
        loading={loading}
        onView={handleView}
        theme={theme} // <-- Pasa el theme
      />
      <RepuestoMaquinaModal
        isOpen={modalOpen}
        mode={modalMode}
        selectedRepuesto={selectedRepuesto}
        formData={formData}
        loading={loading}
        showDeleteConfirm={showDeleteConfirm}
        deleteCountdown={deleteCountdown}
        canConfirmDelete={canConfirmDelete}
        onClose={handleClose}
        onInputChange={handleInputChange}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDeleteClick={handleDeleteClick}
        onDelete={handleDelete}
        onEditMode={handleEditMode}
        theme={theme} // <-- Pasa el theme
      />
    </div>
  );
};
