import React from 'react';
import { OrdenTrabajo } from '../types/ot.types';
import { FaPlus } from 'react-icons/fa';

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface OtTableProps {
  ots: OrdenTrabajo[];
  theme: string;
  onAddOt: () => void;
  onViewOt: (ot: OrdenTrabajo) => void;
  loading: boolean;
  error: string | null;
  tiposMantenimiento: { id: number; nombre: string }[];
  centrosCosto: { id: number; nombre: string }[];
}

export const OtTable: React.FC<OtTableProps> = ({
  ots,
  theme,
  onAddOt,
  onViewOt,
  loading,
  error,
  tiposMantenimiento,
  centrosCosto,
}) => {
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const hoverBgColor = theme === 'dark' ? '#2A2A2A' : '#D6D6D6';
  const theadBgColor = theme === 'dark' ? colors.brown : colors.beige;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const tbodyBgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const buttonBgColor = colors.gold;
  const buttonHoverColor = '#E69D00';

  // Funciones para obtener el nombre a partir del id
  const getTipoOTNombre = (id?: number) =>
    tiposMantenimiento.find((t) => t.id === id)?.nombre || '';
  const getCentroCostoNombre = (id?: number) =>
    centrosCosto.find((c) => c.id === id)?.nombre || '';

  if (loading && ots.length === 0) {
    return (
      <div style={{ color: secondaryTextColor }} className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (error && ots.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: textColor }}>
          Órdenes de Trabajo
        </h2>
        <button
          onClick={onAddOt}
          style={{
            backgroundColor: buttonBgColor,
            color: colors.lightText,
          }}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg shadow transition duration-150 ease-in-out"
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = buttonHoverColor;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = buttonBgColor;
          }}
        >
          <FaPlus /> Nueva OT
        </button>
      </div>

      <div
        style={{ backgroundColor: bgColor }}
        className="shadow-md rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead
              style={{
                backgroundColor: theadBgColor,
                color: theadTextColor,
              }}
            >
              <tr>
                <th className="p-3 text-left font-semibold">ID</th>
                <th className="p-3 text-left font-semibold">Tipo OT</th>
                <th className="p-3 text-left font-semibold">Centro Costo</th>
                <th className="p-3 text-left font-semibold">Estado</th>
                <th className="p-3 text-left font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody
              style={{
                backgroundColor: tbodyBgColor,
                color: textColor,
                borderColor: theme === 'dark' ? '#2A2A2A' : '#D6D6D6',
              }}
              className="divide-y"
            >
              {ots.map((ot) => (
                <tr
                  key={ot.id}
                  onClick={() => onViewOt(ot)}
                  className="cursor-pointer transition duration-150 ease-in-out"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = tbodyBgColor;
                  }}
                >
                  <td className="p-3">{ot.id}</td>
                  <td className="p-3">{getTipoOTNombre(ot.tipoOT_id)}</td>
                  <td className="p-3">
                    {getCentroCostoNombre(ot.centroCosto_id)}
                  </td>
                  <td className="p-3">{ot.estado}</td>
                  <td className="p-3">
                    {typeof ot.fechaHora === 'string'
                      ? ot.fechaHora.split('T')[0]
                      : (ot.fechaHora?.toLocaleDateString?.() ?? '')}
                  </td>
                </tr>
              ))}
              {ots.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron órdenes de trabajo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
