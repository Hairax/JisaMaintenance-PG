import React from 'react';
import { Maquina, MaquinaFormData, ModalMode } from '../types/maquina.types';
import { ProcessOption, SelectOption } from '../hooks/useMaquina';
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

interface MaquinaModalProps {
  isOpen: boolean;
  mode: ModalMode;
  selectedMaquina: Maquina | null;
  formData: Partial<MaquinaFormData>;
  theme: string;
  showDeleteConfirm: boolean;
  deleteCountdown: number;
  canConfirmDelete: boolean;
  loading: boolean;
  centrosCosto: SelectOption[];
  procesos: ProcessOption[];
  proveedores: SelectOption[];
  onClose: () => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onCreateMaquina: () => void;
  onUpdateMaquina: () => void;
  onDeleteClick: () => void;
  onDelete: () => void;
  onEditMode: () => void;
}

export const MaquinaModal: React.FC<MaquinaModalProps> = ({
  isOpen,
  mode,
  selectedMaquina,
  formData,
  theme,
  showDeleteConfirm,
  deleteCountdown,
  canConfirmDelete,
  loading,
  centrosCosto,
  procesos,
  proveedores,
  onClose,
  onInputChange,
  onCreateMaquina,
  onUpdateMaquina,
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
    name: keyof MaquinaFormData,
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

  const buildMachineCode = (machine: Partial<MaquinaFormData> | null) => {
    const centroCosto = machine?.centroCosto_id;
    const procesoId = machine?.proceso_id;
    const correlativo = machine?.correlativo;
    if (!centroCosto || !procesoId || !correlativo) return undefined;

    const proceso = procesos.find((process) => process.id === procesoId);
    const procesoCorrelativo = proceso?.correlativo;
    if (procesoCorrelativo === undefined || procesoCorrelativo === null)
      return undefined;

    return `${centroCosto}.${String(procesoCorrelativo).padStart(2, '0')}.${String(
      correlativo,
    ).padStart(2, '0')}`;
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
            ? 'Nueva Máquina'
            : mode === 'edit'
              ? 'Editar Máquina'
              : 'Detalles de la Máquina'}
        </h2>

        <div className="flex-grow overflow-y-auto pr-2">
          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              {renderFormField('Nombre', 'name', 'text', true)}
              {renderFormField('Fabricante', 'fabricante', 'text', true)}
              {renderFormField(
                'Tipo de Máquina',
                'tipoDeMaquina',
                'text',
                true,
              )}
              {renderFormField(
                'Número de Serie',
                'numeroDeSerie',
                'text',
                true,
              )}
              {renderFormField(
                'Fecha de Fabricación',
                'fechaDeFabricacion',
                'date',
                true,
              )}
              {renderFormField(
                'Fecha de Montaje',
                'fechaDeMontaje',
                'date',
                true,
              )}
              {renderFormField('Costo', 'costo', 'number', true)}
              {renderFormField(
                'Horas Trabajadas',
                'horasTrabajadas',
                'number',
                true,
              )}
              {renderFormField('Correlativo', 'correlativo', 'number')}
              <p className="text-xs text-slate-500">
                Dejar vacío para asignar automáticamente el siguiente
                correlativo.
              </p>

              {/* Centro de Costo */}
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
                  onChange={(id) => {
                    const event = {
                      target: {
                        name: 'centroCosto_id',
                        value: String(id),
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onInputChange(event);
                  }}
                  label="Selecciona un Centro de Costo"
                  inputBg={inputBgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                />
              </div>

              {/* Proceso */}
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
                  onChange={(id) => {
                    const event = {
                      target: {
                        name: 'proceso_id',
                        value: String(id),
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onInputChange(event);
                  }}
                  label="Selecciona un Proceso"
                  showId={false}
                  inputBg={inputBgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                />
              </div>

              {/* Proveedor */}
              <div>
                <label
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Proveedor
                </label>
                <SearchableSelect
                  options={proveedores}
                  value={formData.proveedor_id || 0}
                  onChange={(id) => {
                    const event = {
                      target: {
                        name: 'proveedor_id',
                        value: String(id),
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onInputChange(event);
                  }}
                  label="Selecciona un Proveedor"
                  inputBg={inputBgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                  secondaryTextColor={secondaryTextColor}
                />
              </div>
            </form>
          )}

          {mode === 'view' && selectedMaquina && !showDeleteConfirm && (
            <div className="space-y-2 text-sm">
              <p>
                <strong style={{ color: secondaryTextColor }}>Código:</strong>{' '}
                <span style={{ color: textColor }}>
                  {buildMachineCode(selectedMaquina) ||
                    `ID: ${selectedMaquina.id}`}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Nombre:</strong>{' '}
                <span style={{ color: textColor }}>{selectedMaquina.name}</span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Fabricante:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedMaquina.fabricante}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Tipo:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedMaquina.tipoDeMaquina}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>N° Serie:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedMaquina.numeroDeSerie}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Fecha Fabricación:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedMaquina.fechaDeFabricacion}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Fecha Montaje:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedMaquina.fechaDeMontaje}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Costo:</strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedMaquina.costo}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Horas Trabajadas:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {selectedMaquina.horasTrabajadas}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Centro de Costo:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {centrosCosto.find(
                    (cc) => cc.id === selectedMaquina.centroCosto_id,
                  )?.id || `ID: ${selectedMaquina.centroCosto_id}`}{' '}
                  -
                  {centrosCosto.find(
                    (cc) => cc.id === selectedMaquina.centroCosto_id,
                  )?.name || `ID: ${selectedMaquina.centroCosto_id}`}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Proceso:</strong>{' '}
                <span style={{ color: textColor }}>
                  {procesos.find((p) => p.id === selectedMaquina.proceso_id)
                    ?.correlativo || `ID: ${selectedMaquina.proceso_id}`}
                  -
                  {procesos.find((p) => p.id === selectedMaquina.proceso_id)
                    ?.name || `ID: ${selectedMaquina.proceso_id}`}
                </span>
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Proveedor:
                </strong>{' '}
                <span style={{ color: textColor }}>
                  {proveedores.find(
                    (prov) => prov.id === selectedMaquina.proveedor_id,
                  )?.id || `ID: ${selectedMaquina.proveedor_id}`}{' '}
                  -
                  {proveedores.find(
                    (prov) => prov.id === selectedMaquina.proveedor_id,
                  )?.name || `ID: ${selectedMaquina.proveedor_id}`}
                </span>
              </p>
            </div>
          )}

          {showDeleteConfirm && selectedMaquina && (
            <div style={{ color: textColor }} className="text-center">
              <p className="text-lg font-semibold mb-3">¿Estás seguro?</p>
              <p className="mb-4">
                Estás a punto de eliminar la máquina{' '}
                <strong className="font-medium">{selectedMaquina.name}</strong>.
              </p>
              <p className="text-sm mb-4">
                Esta acción eliminará de manera permanente la máquina.
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
                onClick={onUpdateMaquina}
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
                onClick={onCreateMaquina}
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
                <FaPlus /> Crear Máquina
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
