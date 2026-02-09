import React from 'react';
import { InformeDiarioFormData, ModalMode } from '../types/informe.types';

interface InformeModalProps {
  isOpen: boolean;
  mode: ModalMode;
  selectedInforme: unknown;
  formData: Partial<InformeDiarioFormData>;
  theme: string;
  loading: boolean;
  onClose: () => void;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onCreateInforme: () => void;
}

export const InformeModal: React.FC<InformeModalProps> = ({
  isOpen,
  mode,
  selectedInforme,
  formData,
  theme,
  loading,
  onClose,
  onInputChange,
  onCreateInforme,
}) => {
  if (!isOpen) return null;
  const textColor = theme === 'dark' ? '#FFFFFF' : '#000000';
  const secondaryTextColor = theme === 'dark' ? '#E1CD9B' : '#9E5533';
  const bgColor = theme === 'dark' ? '#1A1A1A' : '#E6E6E6';
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const overlayBgColor = 'rgba(0, 0, 0, 0.75)';

  return (
    <div
      style={{ backgroundColor: overlayBgColor }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
    >
      <div
        style={{ backgroundColor: bgColor, color: textColor }}
        className="rounded-lg max-w-lg w-full p-6 shadow-xl relative flex flex-col max-h-[90vh]"
      >
        <button
          style={{ color: secondaryTextColor }}
          className="absolute top-3 right-4 hover:opacity-80 transition"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        <h2 style={{ color: textColor }} className="text-xl font-semibold mb-4">
          {mode === 'create'
            ? 'Nuevo Informe Diario'
            : mode === 'edit'
              ? 'Editar Informe Diario'
              : 'Detalles del Informe Diario'}
        </h2>
        <div className="flex-grow overflow-y-auto pr-2">
          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              <div>
                <label
                  htmlFor="tecnico_id"
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Técnico
                </label>
                <input
                  type="number"
                  name="tecnico_id"
                  id="tecnico_id"
                  value={formData.tecnico_id ?? ''}
                  onChange={onInputChange}
                  required
                  style={{
                    backgroundColor: inputBgColor,
                    borderColor: inputBorderColor,
                    color: textColor,
                  }}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
                />
              </div>
              <div>
                <label
                  htmlFor="fechaTrabajo"
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Fecha de Trabajo
                </label>
                <input
                  type="date"
                  name="fechaTrabajo"
                  id="fechaTrabajo"
                  value={
                    formData.fechaTrabajo
                      ? String(formData.fechaTrabajo).slice(0, 10)
                      : ''
                  }
                  onChange={onInputChange}
                  required
                  style={{
                    backgroundColor: inputBgColor,
                    borderColor: inputBorderColor,
                    color: textColor,
                  }}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
                />
              </div>
              <div>
                <label
                  htmlFor="observaciones"
                  style={{ color: secondaryTextColor }}
                  className="block text-sm font-medium mb-1"
                >
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  id="observaciones"
                  value={formData.observaciones ?? ''}
                  onChange={onInputChange}
                  style={{
                    backgroundColor: inputBgColor,
                    borderColor: inputBorderColor,
                    color: textColor,
                  }}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-1"
                />
              </div>
              <button
                type="button"
                onClick={onCreateInforme}
                disabled={loading}
                style={{ backgroundColor: '#FBAF11', color: '#FFFFFF' }}
                className="w-full py-2 rounded mt-4 font-semibold shadow hover:bg-yellow-600 transition"
              >
                {mode === 'create' ? 'Crear Informe' : 'Guardar Cambios'}
              </button>
            </form>
          )}
          {mode === 'view' && selectedInforme && (
            <div className="space-y-2 text-sm">
              <p>
                <strong style={{ color: secondaryTextColor }}>ID:</strong>{' '}
                {selectedInforme.id}
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Técnico:</strong>{' '}
                {selectedInforme.tecnico_id}
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>Fecha:</strong>{' '}
                {String(selectedInforme.fechaTrabajo).slice(0, 10)}
              </p>
              <p>
                <strong style={{ color: secondaryTextColor }}>
                  Observaciones:
                </strong>{' '}
                {selectedInforme.observaciones ?? '-'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
