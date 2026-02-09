import React from 'react';
import {
  OrdenTrabajo,
  OrdenTrabajoFormData,
  ModalMode,
} from '../types/ot.types';
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

interface OtModalProps {
  isOpen: boolean;
  mode: ModalMode;
  selectedOT: OrdenTrabajo | null;
  formData: Partial<OrdenTrabajoFormData>;
  theme: string;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
  loading: boolean;
  onClose: () => void;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onCreateOt: () => void;
  onUpdateOt: () => void;
  onDeleteClick: () => void;
  onDelete: () => void;
  onEditMode: () => void;
  tiposMantenimiento: { id: number; nombre: string }[];
  centrosCosto: { id: number; nombre: string }[];
  procesos: { id: number; nombre: string }[];
  maquinas: { id: number; nombre: string }[];
  tecnicos: { id: number; nombre: string }[];
}

export const OtModal: React.FC<OtModalProps> = ({
  isOpen,
  mode,
  selectedOT,
  formData,
  theme,
  showDeleteConfirm,
  deleteCountdown,
  canConfirmDelete,
  loading,
  onClose,
  onInputChange,
  onCreateOt,
  onUpdateOt,
  onDeleteClick,
  onDelete,
  onEditMode,
  tiposMantenimiento,
  centrosCosto,
  procesos,
  maquinas,
  tecnicos,
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
  const editColor = '#1E90FF';
  const editHoverColor = '#1565C0';
  const deleteColor = '#E53935';
  const deleteHoverColor = '#B71C1C';

  const renderFormField = (
    label: string,
    name: keyof OrdenTrabajoFormData,
    type: string = 'text',
    required = false,
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
            ? (formData[name] as Date).toISOString().slice(0, 16)
            : typeof formData[name] === 'undefined'
              ? ''
              : typeof formData[name] === 'object'
                ? ''
                : formData[name]
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

  const renderSelectField = (
    label: string,
    name: keyof OrdenTrabajoFormData,
    options: { id: number; label: string }[],
    required = false,
  ) => (
    <div>
      <label
        htmlFor={name}
        style={{ color: secondaryTextColor }}
        className="block text-sm font-medium mb-1"
      >
        {label}
      </label>
      <select
        name={name}
        id={name}
        value={
          formData[name] instanceof Date
            ? formData[name].toISOString()
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
      >
        <option value="">Selecciona una opción</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  // Campo de selección múltiple para técnicos
  const renderMultiSelectField = (
    label: string,
    name: keyof OrdenTrabajoFormData,
    options: { id: number; label: string }[],
    required = false,
  ) => (
    <div>
      <label
        htmlFor={name}
        style={{ color: secondaryTextColor }}
        className="block text-sm font-medium mb-1"
      >
        {label}
      </label>
      <select
        name={name}
        id={name}
        multiple
        value={formData[name] ?? []}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, (opt) =>
            Number(opt.value),
          );
          onInputChange({
            target: { name, value: selected },
          } as any);
        }}
        required={required}
        style={{
          backgroundColor: inputBgColor,
          borderColor: inputBorderColor,
          color: textColor,
        }}
        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
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
          {mode === 'create'
            ? 'Nueva Orden de Trabajo'
            : mode === 'edit'
              ? 'Editar Orden de Trabajo'
              : 'Detalles de la Orden de Trabajo'}
        </h2>

        <div className="flex-grow overflow-y-auto pr-2">
          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              {renderSelectField(
                'Tipo de Mantenimiento',
                'tipoOT_id',
                tiposMantenimiento.map((t) => ({ id: t.id, label: t.nombre })),
                true,
              )}
              {renderSelectField(
                'Centro de Costo',
                'centroCosto_id',
                centrosCosto.map((c) => ({ id: c.id, label: c.nombre })),
                true,
              )}
              {renderSelectField(
                'Proceso',
                'proceso_id',
                procesos.map((p) => ({ id: p.id, label: p.nombre })),
                true,
              )}
              {renderSelectField(
                'Máquina',
                'maquina_id',
                maquinas.map((m) => ({ id: m.id, label: m.nombre })),
                true,
              )}
              {renderFormField(
                'Descripción de la Tarea',
                'descripcionTarea',
                'text',
                true,
              )}
              {renderFormField(
                'Fecha y Hora',
                'fechaHora',
                'datetime-local',
                true,
              )}
              {renderFormField('Tipo de Cambio', 'tipoCambio', 'number', true)}
              {renderFormField('Estado', 'estado', 'text', true)}
              {renderFormField(
                'Tiempo Estimado',
                'tiempoEstimado',
                'number',
                true,
              )}
              {renderMultiSelectField(
                'Técnicos asignados',
                'tecnicos',
                tecnicos.map((t) => ({ id: t.id, label: t.nombre })),
                true,
              )}
            </form>
          )}

          {mode === 'view' && selectedOT && !showDeleteConfirm ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong style={{ color: secondaryTextColor }}>ID:</strong>{' '}
                {selectedOT.id}
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Tipo de Mantenimiento:
                </strong>{' '}
                {selectedOT.tipoOT?.nombre}
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Descripción:
                </strong>{' '}
                {selectedOT.descripcionTarea}
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Estado:</strong>{' '}
                {selectedOT.estado}
              </p>
              {/* Agrega aquí más campos de solo lectura */}
            </div>
          ) : showDeleteConfirm && selectedOT ? (
            <div style={{ color: textColor }} className="text-center">
              <p className="text-lg font-semibold mb-3">¿Estás seguro?</p>
              <p className="mb-4">
                Estás a punto de eliminar la OT{' '}
                <strong className="font-medium">{selectedOT.id}</strong>.
              </p>
              <p className="text-sm mb-4">
                Esta acción eliminará de manera permanente la orden de trabajo.
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
                className="px-4 py-2 rounded text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={onUpdateOt}
                style={{
                  backgroundColor: primaryButtonBg,
                  color: colors.darkText,
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm transition"
              >
                <FaSave /> Guardar Cambios
              </button>
            </>
          )}
          {mode === 'create' && (
            <>
              <button
                onClick={onClose}
                style={{
                  color: textColor,
                  backgroundColor: 'transparent',
                }}
                className="px-4 py-2 rounded text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={onCreateOt}
                style={{
                  backgroundColor: primaryButtonBg,
                  color: colors.darkText,
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm transition"
              >
                <FaPlus /> Crear OT
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
                className="px-4 py-2 rounded text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={onDelete}
                disabled={!canConfirmDelete || loading}
                style={{
                  backgroundColor: canConfirmDelete ? deleteColor : '#FFB0B0',
                  color: colors.lightText,
                  opacity: loading ? 0.5 : 1,
                  cursor:
                    canConfirmDelete && !loading ? 'pointer' : 'not-allowed',
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
