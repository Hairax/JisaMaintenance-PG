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
  departamentos: { id: number; nombre: string }[];
  objetos: { id: number; nombre: string }[];
  supervisores: { id: number; nombre: string }[];
  subUnidades: { id: number; nombre: string }[];
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
  departamentos,
  objetos,
  supervisores,
  subUnidades,
}) => {
  const [tecnicoSearchId, setTecnicoSearchId] = React.useState('');

  // Usar formData.tecnicos como fuente única de verdad
  const currentTecnicos = (formData.tecnicos as number[]) || [];

  // Resetear búsqueda cuando cambia el modo
  React.useEffect(() => {
    setTecnicoSearchId('');
  }, [mode]);

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

  // Filtrar técnicos por ID de búsqueda - mostrar todos si no hay búsqueda
  const filteredTecnicos = tecnicoSearchId
    ? tecnicos.filter((t) =>
        t.id.toString().includes(tecnicoSearchId.toString()),
      )
    : tecnicos; // Mostrar todos si no hay búsqueda

  const handleAddTecnico = (tecnicoId: number) => {
    if (!currentTecnicos.includes(tecnicoId)) {
      const updatedTecnicos = [...currentTecnicos, tecnicoId];
      onInputChange({
        target: { name: 'tecnicos', value: updatedTecnicos },
      } as any);
      setTecnicoSearchId('');
    }
  };

  const handleRemoveTecnico = (tecnicoId: number) => {
    const updatedTecnicos = currentTecnicos.filter((id) => id !== tecnicoId);
    onInputChange({
      target: { name: 'tecnicos', value: updatedTecnicos },
    } as any);
  };

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
    options: { id: string | number; label: string }[],
    required = false,
  ) => (
    <div>
      <label
        htmlFor={name}
        style={{ color: secondaryTextColor }}
        className="block text-sm font-medium mb-1"
      >
        {label}
        {options.length === 0 && (
          <span
            style={{ color: '#E53935', fontSize: '12px', marginLeft: '8px' }}
          >
            (Sin datos disponibles)
          </span>
        )}
      </label>
      <select
        name={name}
        id={name}
        value={
          formData[name] instanceof Date
            ? formData[name].toISOString()
            : String(formData[name] ?? '')
        }
        onChange={onInputChange}
        required={required}
        disabled={options.length === 0}
        style={{
          backgroundColor: inputBgColor,
          borderColor: inputBorderColor,
          color: textColor,
          opacity: options.length === 0 ? 0.6 : 1,
        }}
        className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
      >
        <option value="">
          {options.length === 0 ? 'Cargando...' : 'Selecciona una opción'}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label && opt.label.trim() ? opt.label : `ID: ${opt.id}`}
          </option>
        ))}
      </select>
    </div>
  );

  // Campo de selección múltiple para técnicos (no se usa - reemplazado por componente custom)
  // Mantener para referencia futuro si es necesario
  /**
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
  */

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
                tiposMantenimiento.map((t) => ({
                  id: t.id,
                  label: `${t.id} - ${t.nombre}`,
                })),
                true,
              )}
              {renderSelectField(
                'Centro de Costo',
                'centroCosto_id',
                centrosCosto.map((c) => ({
                  id: c.id,
                  label: `${c.id} - ${c.nombre}`,
                })),
                true,
              )}
              {renderSelectField(
                'Proceso',
                'proceso_id',
                procesos.map((p) => ({
                  id: p.id,
                  label: `${p.id} - ${p.nombre}`,
                })),
                true,
              )}
              {renderSelectField(
                'Máquina',
                'maquina_id',
                maquinas.map((m) => ({
                  id: m.id,
                  label: `${m.id} - ${m.nombre}`,
                })),
                true,
              )}
              {renderSelectField(
                'Departamento',
                'departamento_id',
                departamentos.map((d) => ({
                  id: d.id,
                  label: `${d.id} - ${d.nombre}`,
                })),
                true,
              )}
              {renderSelectField(
                'Objeto',
                'objeto_id',
                objetos.map((o) => ({
                  id: o.id,
                  label: `${o.id} - ${o.nombre}`,
                })),
                true,
              )}
              {renderSelectField(
                'Supervisor',
                'supervisor_id',
                supervisores.map((s) => ({
                  id: s.id,
                  label: `${s.id} - ${s.nombre}`,
                })),
                true,
              )}
              {renderSelectField(
                'Sub Unidad',
                'subUnidad_id',
                subUnidades.map((su) => ({
                  id: su.id,
                  label: `${su.id} - ${su.nombre}`,
                })),
                false,
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
              {renderSelectField(
                'Estado',
                'estado',
                [
                  { id: 'Abierta', label: 'Abierta' },
                  { id: 'En Progreso', label: 'En Progreso' },
                  { id: 'Cerrada', label: 'Cerrada' },
                ],
                true,
              )}
              {renderFormField(
                'Tiempo Estimado',
                'tiempoEstimado',
                'number',
                true,
              )}

              {/* Sección de Técnicos con búsqueda por ID */}
              <div>
                <label
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-2"
                >
                  Técnicos asignados
                </label>
                <div
                  style={{
                    backgroundColor: inputBgColor,
                    borderColor: inputBorderColor,
                  }}
                  className="border rounded p-3"
                >
                  {/* Input de búsqueda */}
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Buscar técnico por ID..."
                      value={tecnicoSearchId}
                      onChange={(e) => setTecnicoSearchId(e.target.value)}
                      style={{
                        backgroundColor: bgColor,
                        borderColor: inputBorderColor,
                        color: textColor,
                      }}
                      className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1 mb-2"
                    />

                    {/* Coincidencias de búsqueda */}
                    {filteredTecnicos.length > 0 && (
                      <div
                        style={{
                          backgroundColor: bgColor,
                          borderColor: inputBorderColor,
                          maxHeight: '150px',
                          overflowY: 'auto',
                        }}
                        className="border rounded"
                      >
                        {filteredTecnicos.map((tecnico) => (
                          <button
                            key={tecnico.id}
                            type="button"
                            onClick={() => handleAddTecnico(tecnico.id)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 12px',
                              backgroundColor: currentTecnicos.includes(
                                tecnico.id,
                              )
                                ? colors.beige
                                : 'transparent',
                              color: colors.darkText,
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!currentTecnicos.includes(tecnico.id)) {
                                e.currentTarget.style.backgroundColor =
                                  inputBgColor;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!currentTecnicos.includes(tecnico.id)) {
                                e.currentTarget.style.backgroundColor =
                                  'transparent';
                              }
                            }}
                          >
                            ID: {tecnico.id} - {tecnico.nombre}
                            {currentTecnicos.includes(tecnico.id) && (
                              <span style={{ marginLeft: '10px' }}>✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lista de técnicos seleccionados */}
                  <div>
                    <p
                      style={{
                        color: secondaryTextColor,
                        fontSize: '12px',
                        marginBottom: '8px',
                        fontWeight: 'bold',
                      }}
                    >
                      Técnicos seleccionados ({currentTecnicos.length}):
                    </p>
                    {currentTecnicos.length > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        {currentTecnicos.map((tecnicoId) => {
                          const tecnico = tecnicos.find(
                            (t) => t.id === tecnicoId,
                          );
                          return (
                            <div
                              key={tecnicoId}
                              style={{
                                backgroundColor: colors.gold,
                                color: colors.darkText,
                                padding: '6px 10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              ID:{tecnicoId} -{' '}
                              {tecnico?.nombre || 'Desconocido'}
                              <button
                                type="button"
                                onClick={() => handleRemoveTecnico(tecnicoId)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: colors.darkText,
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  padding: '0',
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p
                        style={{
                          color: secondaryTextColor,
                          fontSize: '12px',
                          fontStyle: 'italic',
                        }}
                      >
                        Ningún técnico seleccionado
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}

          {mode === 'view' && selectedOT && !showDeleteConfirm ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                {/* Fila 1: ID y Tipo de Mantenimiento */}
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>ID:</strong>{' '}
                    {selectedOT.id}
                  </p>
                </div>
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>
                      Tipo de Mantenimiento:
                    </strong>{' '}
                    {selectedOT.tipoOT?.nombre || '—'}
                  </p>
                </div>

                {/* Fila 2: Centro de Costo y Proceso */}
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>
                      Centro de Costo:
                    </strong>{' '}
                    {(selectedOT as any).costCenter?.name ||
                      selectedOT.centroCosto?.nombre ||
                      '—'}
                  </p>
                </div>
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>
                      Proceso:
                    </strong>{' '}
                    {selectedOT.proceso?.name ||
                      selectedOT.proceso?.nombre ||
                      '—'}
                  </p>
                </div>

                {/* Fila 3: Máquina y Estado */}
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>
                      Máquina:
                    </strong>{' '}
                    {selectedOT.maquina?.name ||
                      selectedOT.maquina?.nombre ||
                      '—'}
                  </p>
                </div>
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>
                      Estado:
                    </strong>{' '}
                    <span
                      style={{
                        color:
                          selectedOT.estado === 'Cerrada'
                            ? '#E53935'
                            : selectedOT.estado === 'En Progreso'
                              ? '#FBC02D'
                              : '#4ADE80',
                        fontWeight: 'bold',
                      }}
                    >
                      {selectedOT.estado || '—'}
                    </span>
                  </p>
                </div>

                {/* Fila 4: Supervisor y Tipo de Cambio */}
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>
                      Supervisor:
                    </strong>{' '}
                    {selectedOT.supervisor?.nombre || '—'}
                  </p>
                </div>
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>
                      Tipo de Cambio:
                    </strong>{' '}
                    {selectedOT.tipoCambio || '—'}
                  </p>
                </div>

                {/* Fila 5: Tiempo Estimado y Fecha */}
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>
                      Tiempo Estimado (hrs):
                    </strong>{' '}
                    {selectedOT.tiempoEstimado || '—'}
                  </p>
                </div>
                <div>
                  <p>
                    <strong style={{ color: secondaryTextColor }}>
                      Fecha y Hora:
                    </strong>{' '}
                    {selectedOT.fechaHora
                      ? new Date(selectedOT.fechaHora).toLocaleString('es-ES')
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Descripción de la Tarea - campo ancho */}
              <div>
                <p>
                  <strong style={{ color: secondaryTextColor }}>
                    Descripción de la Tarea:
                  </strong>
                </p>
                <p
                  style={{
                    backgroundColor: inputBgColor,
                    padding: '8px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {selectedOT.descripcionTarea || '—'}
                </p>
              </div>

              {/* Técnicos asignados */}
              <div>
                <p>
                  <strong style={{ color: secondaryTextColor }}>
                    Técnicos Asignados:
                  </strong>
                </p>
                {selectedOT.tecnicos && selectedOT.tecnicos.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '8px',
                    }}
                  >
                    {selectedOT.tecnicos.map((tecnicoId, idx) => {
                      const tecnico = tecnicos.find((t) => t.id === tecnicoId);
                      return (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: colors.gold,
                            color: colors.darkText,
                            padding: '6px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          ID: {tecnicoId} - {tecnico?.nombre || 'Desconocido'}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ marginTop: '4px', fontStyle: 'italic' }}>—</p>
                )}
              </div>
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
