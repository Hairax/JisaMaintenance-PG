import React from 'react';
import { User } from '../../../shared/types/user.types';
import { UserFormData, ModalMode } from '../types/user.types';
import { FaTimes, FaEdit, FaTrash, FaSave, FaPlus } from 'react-icons/fa';

// Roles disponibles
const CARGO_OPTIONS: { value: string; label: string }[] = [
  { value: 'externo', label: 'Externo' },
  { value: 'admin', label: 'Administrador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'jefe-mantenimiento', label: 'Jefe de Mantenimiento' },
  { value: 'encargado-almacen', label: 'Encargado de Almacén' },
  { value: 'usuario-contable', label: 'Usuario Contable' },
];

// Paleta de colores
const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface UserModalProps {
  isOpen: boolean;
  mode: ModalMode;
  selectedUser: User | null;
  formData: Partial<UserFormData>;
  theme: string;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
  loading: boolean;
  onClose: () => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onCreateUser: () => void;
  onUpdateUser: () => void;
  onDeleteClick: () => void;
  onDelete: () => void;
  onEditMode: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  mode,
  selectedUser,
  formData,
  theme,
  showDeleteConfirm,
  deleteCountdown,
  canConfirmDelete,
  loading,
  onClose,
  onInputChange,
  onCreateUser,
  onUpdateUser,
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
  const primaryButtonHover = '#E69D00'; // Versión oscurecida del gold

  // Colores para acciones específicas
  const editColor = theme === 'dark' ? '#70B5FF' : '#0057B8';
  const editHoverColor = theme === 'dark' ? '#90C5FF' : '#004799';
  const deleteColor = theme === 'dark' ? '#FF7070' : '#D32F2F';
  const deleteHoverColor = theme === 'dark' ? '#FF9090' : '#B71C1C';

  const renderFormField = (
    label: string,
    name: keyof UserFormData,
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
          typeof formData[name] === 'boolean'
            ? String(formData[name])
            : formData[name] || ''
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
            ? 'Nuevo Usuario'
            : mode === 'edit'
              ? 'Editar Usuario'
              : 'Detalles del Usuario'}
        </h2>

        <div className="flex-grow overflow-y-auto pr-2">
          {mode === 'add' || mode === 'edit' ? (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              {renderFormField('Nombre', 'name', 'text', true)}
              {renderFormField('Apellido', 'lastName', 'text', true)}
              {renderFormField('Email', 'email', 'email', true)}
              {mode === 'add' &&
                renderFormField('Contraseña', 'password', 'password', true)}
              {renderFormField('Teléfono', 'phone')}
              {renderFormField('Celular', 'celphone')}
              {renderFormField('Nombre de Usuario', 'userName')}
              <div>
                <label
                  htmlFor="cargo"
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Cargo
                </label>
                <select
                  name="cargo"
                  id="cargo"
                  value={formData.cargo || ''}
                  onChange={onInputChange}
                  style={{
                    backgroundColor: inputBgColor,
                    borderColor: inputBorderColor,
                    color: textColor,
                  }}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
                >
                  <option value="">-- Seleccionar cargo --</option>
                  {CARGO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {renderFormField('Hora', 'hora$', 'number')}
              {renderFormField('Minutos', 'minutos$', 'number')}
              {mode === 'edit' && (
                <div>
                  <label
                    htmlFor="status"
                    style={{ color: secondaryTextColor }}
                    className="block text-sm font-medium mb-1"
                  >
                    Estado
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={String(formData.status ?? true)}
                    onChange={onInputChange}
                    style={{
                      backgroundColor: inputBgColor,
                      borderColor: inputBorderColor,
                      color: textColor,
                    }}
                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              )}
            </form>
          ) : mode === 'view' && selectedUser && !showDeleteConfirm ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong style={{ color: secondaryTextColor }}>ID:</strong>{' '}
                <span style={{ color: textColor }}>{selectedUser.id}</span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Nombre:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedUser.name} {selectedUser.lastName}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Email:</strong>{' '}
                <span style={{ color: textColor }}>{selectedUser.email}</span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Teléfono:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedUser.phone || '-'}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Celular:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedUser.celphone || '-'}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Usuario:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedUser.userName}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Cargo:</strong>{' '}
                <span style={{ color: textColor }}>{selectedUser.cargo}</span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Hora:</strong>{' '}
                <span style={{ color: textColor }}>{selectedUser.hora$}</span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Minutos:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedUser.minutos$}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Estado:</strong>
                <span
                  style={{
                    backgroundColor: selectedUser.status
                      ? theme === 'dark'
                        ? '#2C6E2C' // verde oscuro
                        : '#D1E7DD' // verde claro
                      : theme === 'dark'
                        ? '#8B3A3A' // rojo oscuro
                        : '#F8D7DA', // rojo claro
                    color: selectedUser.status
                      ? theme === 'dark'
                        ? '#AEFFAE' // texto verde claro
                        : '#0F5132' // texto verde oscuro
                      : theme === 'dark'
                        ? '#FFB0B0' // texto rojo claro
                        : '#842029', // texto rojo oscuro
                  }}
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {selectedUser.status ? 'Activo' : 'Inactivo'}
                </span>
              </p>
            </div>
          ) : showDeleteConfirm && selectedUser ? (
            <div style={{ color: textColor }} className="text-center">
              <p className="text-lg font-semibold mb-3">¿Estás seguro?</p>
              <p className="mb-4">
                Estás a punto de eliminar (desactivar) al usuario{' '}
                <strong className="font-medium">
                  {selectedUser.name} {selectedUser.lastName}
                </strong>
                .
              </p>
              <p className="text-sm mb-4">
                Esta acción eliminara de manera permanente el usuario.
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
                onClick={() => onClose()}
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
                onClick={onUpdateUser}
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
                onClick={onCreateUser}
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
                <FaPlus /> Crear Usuario
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
