import React from 'react';
import { Process } from '../types/process.types';
import { FaTimes, FaEdit, FaTrash, FaSave, FaPlus } from 'react-icons/fa';

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

type ModalMode = 'view' | 'edit' | 'add';

interface ProcessModalProps {
  isOpen: boolean;
  mode: ModalMode;
  selectedProcess: Process | null;
  formData: Partial<Process>;
  theme: string;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
  loading: boolean;
  onClose: () => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onCreateProcess: () => void;
  onUpdateProcess: () => void;
  onDeleteClick: () => void;
  onDelete: () => void;
  onEditMode: () => void;
}

export const ProcessModal: React.FC<ProcessModalProps> = ({
  isOpen,
  mode,
  selectedProcess,
  formData,
  theme,
  showDeleteConfirm,
  deleteCountdown,
  canConfirmDelete,
  loading,
  onClose,
  onInputChange,
  onCreateProcess,
  onUpdateProcess,
  onDeleteClick,
  onDelete,
  onEditMode,
}) => {
  if (!isOpen) return null;

  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const overlayBgColor = 'rgba(0, 0, 0, 0.75)';
  const borderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const primaryButtonBg = colors.gold;
  const primaryButtonHover = '#E69D00';
  const editColor = theme === 'dark' ? '#70B5FF' : '#0057B8';
  const editHoverColor = theme === 'dark' ? '#90C5FF' : '#004799';
  const deleteColor = theme === 'dark' ? '#FF7070' : '#D32F2F';
  const deleteHoverColor = theme === 'dark' ? '#FF9090' : '#B71C1C';

  const renderFormField = (
    label: string,
    name: keyof Process,
    type: string = 'text',
    required: boolean = false,
  ) => (
    <div>
      <label
        htmlFor={name}
        style={{ color: secondaryTextColor }}
        className="block text-sm font-medium mb-1"
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={
          formData[name] instanceof Date
            ? (formData[name] as Date).toISOString()
            : (formData[name] ?? '')
        }
        onChange={onInputChange}
        required={required}
        style={{
          backgroundColor: inputBgColor,
          borderColor: inputBorderColor,
          color: textColor,
        }}
        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
      />
    </div>
  );

  return (
    <div
      style={{ backgroundColor: overlayBgColor }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
    >
      <div
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
        className="rounded-lg max-w-lg w-full p-6 shadow-xl relative flex flex-col max-h-[90vh]"
      >
        {!showDeleteConfirm && (
          <button
            style={{ color: secondaryTextColor }}
            className="absolute top-3 right-4 hover:opacity-80 transition"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        )}

        <h2 style={{ color: textColor }} className="text-xl font-semibold mb-4">
          {mode === 'add'
            ? 'Nuevo Proceso'
            : mode === 'edit'
              ? 'Editar Proceso'
              : 'Detalles del Proceso'}
        </h2>

        <div className="flex-grow overflow-y-auto pr-2">
          {mode === 'add' || mode === 'edit' ? (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              {renderFormField('Nombre', 'name', 'text', true)}
              {renderFormField(
                'Centro de Costo (ID)',
                'centroCosto',
                'number',
                true,
              )}
            </form>
          ) : mode === 'view' && selectedProcess && !showDeleteConfirm ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong style={{ color: secondaryTextColor }}>ID:</strong>{' '}
                <span style={{ color: textColor }}>{selectedProcess.id}</span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Nombre:</strong>{' '}
                <span style={{ color: textColor }}>{selectedProcess.name}</span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Centro de Costo:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedProcess.centroCosto}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Creado:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedProcess.createdAt instanceof Date
                    ? selectedProcess.createdAt.toLocaleString()
                    : selectedProcess.createdAt}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Actualizado:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedProcess.updatedAt instanceof Date
                    ? selectedProcess.updatedAt.toLocaleString()
                    : selectedProcess.updatedAt}
                </span>
              </p>
            </div>
          ) : showDeleteConfirm && selectedProcess ? (
            <div style={{ color: textColor }} className="text-center">
              <p className="text-lg font-semibold mb-3">¿Estás seguro?</p>
              <p className="mb-4">
                Estás a punto de eliminar el proceso{' '}
                <strong className="font-medium">{selectedProcess.name}</strong>.
              </p>
              <p className="text-sm mb-4">
                Esta acción eliminará de manera permanente el proceso.
              </p>
              {deleteCountdown > 0 && (
                <p
                  style={{ color: colors.gold }}
                  className="text-2xl font-bold my-4"
                >
                  {deleteCountdown}
                </p>
              )}
              {canConfirmDelete && (
                <p
                  style={{ color: theme === 'dark' ? '#4ADE80' : '#166534' }}
                  className="text-sm my-4"
                >
                  Puedes confirmar la eliminación.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div
          style={{ borderColor: borderColor }}
          className={`mt-6 pt-4 border-t flex ${showDeleteConfirm ? 'justify-between' : 'justify-end'} gap-3`}
        >
          {mode === 'view' && !showDeleteConfirm && (
            <>
              <button
                onClick={onEditMode}
                style={{ color: editColor }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = editHoverColor;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = editColor;
                }}
                className="flex items-center gap-1.5 text-sm transition duration-150 ease-in-out"
              >
                <FaEdit /> Editar
              </button>
              <button
                onClick={onDeleteClick}
                style={{ color: deleteColor }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = deleteHoverColor;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = deleteColor;
                }}
                className="flex items-center gap-1.5 text-sm transition duration-150 ease-in-out"
              >
                <FaTrash /> Eliminar
              </button>
            </>
          )}
          {mode === 'edit' && (
            <>
              <button
                onClick={onClose}
                style={{
                  color: textColor,
                  backgroundColor: 'transparent',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme === 'dark' ? '#2A2A2A' : '#D6D6D6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                className="px-4 py-2 rounded text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={onUpdateProcess}
                style={{
                  backgroundColor: primaryButtonBg,
                  color: colors.darkText,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = primaryButtonHover;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = primaryButtonBg;
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm transition"
              >
                <FaSave /> Guardar Cambios
              </button>
            </>
          )}
          {mode === 'add' && (
            <>
              <button
                onClick={onClose}
                style={{
                  color: textColor,
                  backgroundColor: 'transparent',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme === 'dark' ? '#2A2A2A' : '#D6D6D6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                className="px-4 py-2 rounded text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={onCreateProcess}
                style={{
                  backgroundColor: primaryButtonBg,
                  color: colors.darkText,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = primaryButtonHover;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = primaryButtonBg;
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm transition"
              >
                <FaPlus /> Crear Proceso
              </button>
            </>
          )}
          {showDeleteConfirm && (
            <>
              <button
                onClick={onClose}
                style={{
                  color: textColor,
                  backgroundColor: 'transparent',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme === 'dark' ? '#2A2A2A' : '#D6D6D6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                className="px-4 py-2 rounded text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={onDelete}
                disabled={!canConfirmDelete || loading}
                style={{
                  backgroundColor: canConfirmDelete
                    ? deleteColor
                    : theme === 'dark'
                      ? '#8B3A3A'
                      : '#FFB0B0',
                  color: theme === 'dark' ? colors.lightText : colors.lightText,
                  opacity: loading ? 0.5 : 1,
                  cursor:
                    canConfirmDelete && !loading ? 'pointer' : 'not-allowed',
                }}
                onMouseOver={(e) => {
                  if (canConfirmDelete && !loading) {
                    e.currentTarget.style.backgroundColor = deleteHoverColor;
                  }
                }}
                onMouseOut={(e) => {
                  if (canConfirmDelete && !loading) {
                    e.currentTarget.style.backgroundColor = deleteColor;
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm transition"
              >
                <FaTrash />{' '}
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
