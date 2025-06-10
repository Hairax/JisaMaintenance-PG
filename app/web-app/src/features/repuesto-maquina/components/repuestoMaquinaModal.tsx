import React from 'react';
import {
  RepuestoMaquina,
  CreateRepuestoMaquinaDto,
  UpdateRepuestoMaquinaDto,
} from '../types/repuestoMaquina.types';

interface RepuestoMaquinaModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit' | 'view';
  selectedRepuesto: RepuestoMaquina | null;
  formData: Partial<CreateRepuestoMaquinaDto & UpdateRepuestoMaquinaDto>;
  loading: boolean;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
  theme: string;
  onClose: () => void;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onCreate: () => void;
  onUpdate: () => void;
  onDeleteClick: () => void;
  onDelete: () => void;
  onEditMode: () => void;
}

export const RepuestoMaquinaModal: React.FC<RepuestoMaquinaModalProps> = ({
  isOpen,
  mode,
  selectedRepuesto,
  formData,
  loading,
  showDeleteConfirm,
  deleteCountdown,
  canConfirmDelete,
  onClose,
  onInputChange,
  onCreate,
  onUpdate,
  onDeleteClick,
  onDelete,
  onEditMode,
}) => {
  if (!isOpen) return null;

  const renderFormField = (
    label: string,
    name: keyof (CreateRepuestoMaquinaDto & UpdateRepuestoMaquinaDto),
    type: string = 'text',
    required = false,
  ) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] ?? ''}
        onChange={onInputChange}
        required={required}
        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl relative flex flex-col max-h-[90vh]">
        <button
          className="absolute top-3 right-4 hover:opacity-80 transition"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4">
          {mode === 'add'
            ? 'Agregar Repuesto de Máquina'
            : mode === 'edit'
              ? 'Editar Repuesto de Máquina'
              : 'Detalles del Repuesto'}
        </h2>
        <div className="flex-grow overflow-y-auto pr-2">
          {(mode === 'add' || mode === 'edit') && (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              {renderFormField('Nombre', 'nombre', 'text', true)}
              {renderFormField('Cantidad', 'cantidad', 'number', true)}
              {renderFormField(
                'Costo Unitario',
                'costoUnitario',
                'number',
                true,
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion ?? ''}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
                  rows={2}
                />
              </div>
              {renderFormField('ID Máquina', 'maquina_id', 'number', true)}
              {renderFormField('ID SubUnidad', 'subUnidad', 'number', false)}
            </form>
          )}
          {mode === 'view' && selectedRepuesto && !showDeleteConfirm && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Nombre:</strong> {selectedRepuesto.nombre}
              </p>
              <p>
                <strong>Cantidad:</strong> {selectedRepuesto.cantidad}
              </p>
              <p>
                <strong>Costo Unitario:</strong>{' '}
                {selectedRepuesto.costoUnitario}
              </p>
              <p>
                <strong>Descripción:</strong> {selectedRepuesto.descripcion}
              </p>
              <p>
                <strong>ID Máquina:</strong> {selectedRepuesto.maquina_id}
              </p>
              <p>
                <strong>ID SubUnidad:</strong>{' '}
                {selectedRepuesto.subUnidad_id ?? 'N/A'}
              </p>
              <p>
                <strong>Creado:</strong> {selectedRepuesto.createdAt}
              </p>
              <p>
                <strong>Actualizado:</strong> {selectedRepuesto.updatedAt}
              </p>
            </div>
          )}
          {showDeleteConfirm && selectedRepuesto && (
            <div className="text-center">
              <p className="text-lg font-semibold mb-3">¿Estás seguro?</p>
              <p className="mb-4">
                Estás a punto de eliminar el repuesto{' '}
                <strong>{selectedRepuesto.nombre}</strong>.
              </p>
              <p className="text-sm mb-4">
                Esta acción eliminará de manera permanente el repuesto.
              </p>
              {deleteCountdown > 0 && (
                <p className="text-2xl font-bold my-4">{deleteCountdown}</p>
              )}
              {canConfirmDelete && (
                <p className="text-sm my-4 text-green-700">
                  Puedes confirmar la eliminación.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t flex justify-end gap-3">
          {mode === 'view' && !showDeleteConfirm && (
            <>
              <button
                onClick={onEditMode}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition"
              >
                Editar
              </button>
              <button
                onClick={onDeleteClick}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 transition"
              >
                Eliminar
              </button>
            </>
          )}
          {mode === 'edit' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-sm bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={onUpdate}
                disabled={loading}
                className="px-4 py-2 rounded text-sm bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Guardar Cambios
              </button>
            </>
          )}
          {mode === 'add' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-sm bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={onCreate}
                disabled={loading}
                className="px-4 py-2 rounded text-sm bg-green-600 text-white hover:bg-green-700"
              >
                Crear
              </button>
            </>
          )}
          {showDeleteConfirm && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-sm bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={onDelete}
                disabled={!canConfirmDelete || loading}
                className={`px-4 py-2 rounded text-sm ${
                  canConfirmDelete && !loading
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-300 text-white cursor-not-allowed'
                }`}
              >
                {canConfirmDelete
                  ? 'Confirmar Eliminación'
                  : `Confirmar (${deleteCountdown})`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
