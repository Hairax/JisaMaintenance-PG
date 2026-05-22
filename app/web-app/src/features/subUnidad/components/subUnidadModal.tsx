import React from 'react';
import {
  SubUnidad,
  SubUnidadFormData,
  ModalMode,
} from '../types/subUnidad.types';
import { SearchableSelect } from '../../../shared/components/SearchableSelect';
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

interface SelectOption {
  id: number;
  name: string;
}

interface ProcessOption extends SelectOption {
  centroCosto: number;
  correlativo?: number;
}

interface MachineOption extends SelectOption {
  centroCosto: number;
  proceso: number;
  correlativo?: number;
}

interface SubUnidadModalProps {
  isOpen: boolean;
  mode: ModalMode;
  selectedSubUnidad: SubUnidad | null;
  formData: Partial<SubUnidadFormData>;
  theme: string;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
  loading: boolean;
  centrosCosto: SelectOption[];
  procesos: ProcessOption[];
  maquinas: MachineOption[];
  onClose: () => void;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onCreateSubUnidad: () => void;
  onUpdateSubUnidad: () => void;
  onDeleteClick: () => void;
  onDelete: () => void;
  onEditMode: () => void;
}

export const SubUnidadModal: React.FC<SubUnidadModalProps> = ({
  isOpen,
  mode,
  selectedSubUnidad,
  formData,
  theme,
  showDeleteConfirm,
  deleteCountdown,
  canConfirmDelete,
  loading,
  centrosCosto,
  procesos,
  maquinas,
  onClose,
  onInputChange,
  onCreateSubUnidad,
  onUpdateSubUnidad,
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
    name: keyof SubUnidadFormData,
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
        value={formData[name] ?? ''}
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

  const filteredProcesos = procesos.filter((process) => {
    return (
      !formData.centroCosto_id ||
      process.centroCosto === Number(formData.centroCosto_id)
    );
  });

  const filteredMaquinas = maquinas.filter((machine) => {
    return (
      !formData.proceso_id || machine.proceso === Number(formData.proceso_id)
    );
  });

  const buildSubUnidadCode = (subUnidad: SubUnidad | null) => {
    if (!subUnidad) return undefined;

    const machine = maquinas.find((m) => m.id === subUnidad.maquina_id);
    const process = procesos.find((p) => p.id === machine?.proceso);
    const centroCosto = machine?.centroCosto;
    const procesoCorrelativo = process?.correlativo;
    const maquinaCorrelativo = machine?.correlativo;
    const subUnidadCorrelativo = subUnidad.correlativo;

    if (
      centroCosto === undefined ||
      procesoCorrelativo == null ||
      maquinaCorrelativo == null ||
      subUnidadCorrelativo == null
    ) {
      return undefined;
    }

    return `${centroCosto}.${String(procesoCorrelativo).padStart(2, '0')}.${String(
      maquinaCorrelativo,
    ).padStart(2, '0')}.${String(subUnidadCorrelativo).padStart(2, '0')}`;
  };

  const buildPreviewCode = () => {
    const centroCosto = formData.centroCosto_id;
    const proceso = procesos.find((p) => p.id === formData.proceso_id);
    const machine = maquinas.find((m) => m.id === formData.maquina_id);
    const subUnidadCorrelativo = formData.correlativo;

    if (
      centroCosto === undefined ||
      !proceso ||
      !machine ||
      subUnidadCorrelativo == null ||
      proceso.correlativo == null ||
      machine.correlativo == null
    ) {
      return undefined;
    }

    return `${centroCosto}.${String(proceso.correlativo ?? '').padStart(2, '0')}.${String(
      machine.correlativo ?? '',
    ).padStart(2, '0')}.${String(subUnidadCorrelativo).padStart(2, '0')}`;
  };

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
            ? 'Nueva SubUnidad'
            : mode === 'edit'
              ? 'Editar SubUnidad'
              : 'Detalles de la SubUnidad'}
        </h2>

        <div className="flex-grow overflow-y-auto pr-2">
          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              {renderFormField('Descripción', 'descripcion', 'text', true)}

              <div>
                <label
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Centro de Costo
                </label>
                <SearchableSelect
                  options={centrosCosto}
                  value={formData.centroCosto_id || 0}
                  onChange={(id) =>
                    onInputChange({
                      target: { name: 'centroCosto_id', value: String(id) },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  label="Selecciona un Centro de Costo"
                  inputBg={inputBgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                />
              </div>

              <div>
                <label
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Proceso
                </label>
                <SearchableSelect
                  options={filteredProcesos}
                  value={formData.proceso_id || 0}
                  onChange={(id) =>
                    onInputChange({
                      target: { name: 'proceso_id', value: String(id) },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  label="Selecciona un Proceso"
                  showId={false}
                  inputBg={inputBgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  disabled={!formData.centroCosto_id}
                />
              </div>

              <div>
                <label
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Máquina
                </label>
                <SearchableSelect
                  options={filteredMaquinas}
                  value={formData.maquina_id || 0}
                  onChange={(id) =>
                    onInputChange({
                      target: { name: 'maquina_id', value: String(id) },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  label="Selecciona una Máquina"
                  showId={false}
                  inputBg={inputBgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                  disabled={!formData.proceso_id}
                />
              </div>

              {renderFormField('Correlativo', 'correlativo', 'number')}
              <p className="text-xs text-slate-500">
                Si dejas este campo vacío, el sistema asignará el siguiente
                correlativo disponible para la máquina.
              </p>
              {buildPreviewCode() && (
                <p className="text-xs text-slate-500">
                  Código compuesto: <strong>{buildPreviewCode()}</strong>
                </p>
              )}
            </form>
          )}

          {mode === 'view' && selectedSubUnidad && !showDeleteConfirm && (
            <div className="space-y-2 text-sm">
              <p>
                <strong style={{ color: secondaryTextColor }}>Código:</strong>{' '}
                <span style={{ color: textColor }}>
                  {buildSubUnidadCode(selectedSubUnidad) ||
                    `ID ${selectedSubUnidad.id}`}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Descripción:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedSubUnidad.descripcion}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Centro de Costo:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {centrosCosto.find(
                    (cc) =>
                      cc.id ===
                      maquinas.find(
                        (m) => m.id === selectedSubUnidad.maquina_id,
                      )?.centroCosto,
                  )?.name || 'N/A'}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Proceso:</strong>{' '}
                <span style={{ color: textColor }}>
                  {procesos.find(
                    (p) =>
                      p.id ===
                      maquinas.find(
                        (m) => m.id === selectedSubUnidad.maquina_id,
                      )?.proceso,
                  )?.name || 'N/A'}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Máquina:</strong>{' '}
                <span style={{ color: textColor }}>
                  {maquinas.find((m) => m.id === selectedSubUnidad.maquina_id)
                    ?.name || selectedSubUnidad.maquina_id}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Creado:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedSubUnidad.createdAt}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Actualizado:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedSubUnidad.updatedAt}
                </span>
              </p>
            </div>
          )}

          {showDeleteConfirm && selectedSubUnidad && (
            <div style={{ color: textColor }} className="text-center">
              <p className="text-lg font-semibold mb-3">¿Estás seguro?</p>
              <p className="mb-4">
                Estás a punto de eliminar la subunidad{' '}
                <strong className="font-medium">
                  {selectedSubUnidad.descripcion}
                </strong>
                .
              </p>
              <p className="text-sm mb-4">
                Esta acción eliminará de manera permanente la subunidad.
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
                onClick={onUpdateSubUnidad}
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
                onClick={onCreateSubUnidad}
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
                <FaPlus /> Crear SubUnidad
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
