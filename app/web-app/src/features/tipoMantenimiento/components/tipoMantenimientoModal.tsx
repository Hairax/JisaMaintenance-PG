import React from 'react';
import {
  TipoMantenimiento,
  TipoMantenimientoFormData,
  ModalMode,
} from '../types/tipoMantenimiento.types';

// Paleta de colores (puedes importar si ya la tienes en otro archivo)
const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface TipoMantenimientoModalProps {
  isOpen: boolean;
  mode: ModalMode;
  selectedTipoMantenimiento: TipoMantenimiento | null;
  formData: Partial<TipoMantenimientoFormData>;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
  loading: boolean;
  theme?: string;
  onClose: () => void;
  onInputChange: (name: string, value: string) => void;
  onCreate: () => void;
  onUpdate: () => void;
  onDeleteClick: () => void;
  onDelete: () => void;
  onEditMode?: () => void;
}

export const TipoMantenimientoModal: React.FC<TipoMantenimientoModalProps> = ({
  isOpen,
  mode,
  selectedTipoMantenimiento,
  formData,
  showDeleteConfirm,
  deleteCountdown,
  canConfirmDelete,
  loading,
  theme = 'light',
  onClose,
  onInputChange,
  onCreate,
  onUpdate,
  onDeleteClick,
  onDelete,
  onEditMode,
}) => {
  if (!isOpen) return null;

  // Colores basados en el tema
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

  const renderForm = () => (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: secondaryTextColor }}
        >
          Nombre
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre ?? ''}
          onChange={(e) => onInputChange('nombre', e.target.value)}
          className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
          style={{
            backgroundColor: inputBgColor,
            borderColor: inputBorderColor,
            color: textColor,
          }}
          required
          disabled={loading}
        />
      </div>
    </form>
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
        className="rounded-lg max-w-md w-full p-6 shadow-xl relative flex flex-col max-h-[90vh]"
      >
        {!showDeleteConfirm && (
          <button
            style={{ color: secondaryTextColor }}
            className="absolute top-3 right-4 hover:opacity-80 transition"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        )}

        <h2 style={{ color: textColor }} className="text-xl font-semibold mb-4">
          {mode === 'create'
            ? 'Nuevo Tipo de Mantenimiento'
            : mode === 'edit'
              ? 'Editar Tipo de Mantenimiento'
              : 'Detalles del Tipo de Mantenimiento'}
        </h2>

        <div className="flex-grow overflow-y-auto pr-2">
          {(mode === 'create' || mode === 'edit') && renderForm()}

          {mode === 'view' &&
            selectedTipoMantenimiento &&
            !showDeleteConfirm && (
              <div className="space-y-2 text-sm">
                <p>
                  <strong style={{ color: secondaryTextColor }}>Nombre:</strong>{' '}
                  <span style={{ color: textColor }}>
                    {selectedTipoMantenimiento.nombre}
                  </span>
                </p>
                <p>
                  <strong style={{ color: secondaryTextColor }}>Creado:</strong>{' '}
                  <span style={{ color: textColor }}>
                    {selectedTipoMantenimiento.createdAt}
                  </span>
                </p>
                <p>
                  <strong style={{ color: secondaryTextColor }}>
                    Actualizado:
                  </strong>{' '}
                  <span style={{ color: textColor }}>
                    {selectedTipoMantenimiento.updatedAt}
                  </span>
                </p>
              </div>
            )}

          {showDeleteConfirm && selectedTipoMantenimiento && (
            <div style={{ color: textColor }} className="text-center">
              <p className="text-lg font-semibold mb-3">¿Estás seguro?</p>
              <p className="mb-4">
                Esta acción eliminará el tipo de mantenimiento{' '}
                <strong className="font-medium">
                  {selectedTipoMantenimiento.nombre}
                </strong>
                .
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
          )}
        </div>

        <div
          style={{ borderColor: borderColor }}
          className={`mt-6 pt-4 border-t flex ${showDeleteConfirm ? 'justify-between' : 'justify-end'} gap-3`}
        >
          {mode === 'create' && (
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
                onClick={onCreate}
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
                disabled={loading}
              >
                Crear
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
                onClick={onUpdate}
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
                disabled={loading}
              >
                Guardar
              </button>
            </>
          )}

          {mode === 'view' && !showDeleteConfirm && (
            <>
              {onEditMode && (
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
                  disabled={loading}
                >
                  Editar
                </button>
              )}
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
                disabled={loading}
              >
                Eliminar
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
                disabled={loading}
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
                  color: colors.lightText,
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
