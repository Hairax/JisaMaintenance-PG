import React from 'react';
import { Repuesto } from '../types/repuesto.types';
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

interface RepuestoTableProps {
  repuestos: Repuesto[];
  theme: string;
  onAddRepuesto: () => void;
  onViewRepuesto: (repuesto: Repuesto) => void;
  loading: boolean;
  error: string | null;
}

export const RepuestoTable: React.FC<RepuestoTableProps> = ({
  repuestos,
  theme,
  onAddRepuesto,
  onViewRepuesto,
  loading,
  error,
}) => {
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const theadBgColor = theme === 'dark' ? colors.brown : colors.gold;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const tbodyBgColor = theme === 'dark' ? '#232323' : '#FAFAFA';
  const buttonBgColor = colors.gold;
  const buttonHoverColor = '#E69D00';
  const hoverBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';

  if (error && !loading) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: textColor }}>
          Repuestos
        </h2>
        <button
          onClick={onAddRepuesto}
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
          <FaPlus /> Agregar Repuesto
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
                <th className="p-3 text-left font-semibold">Nombre</th>
                <th className="p-3 text-left font-semibold">Cantidad</th>
                <th className="p-3 text-left font-semibold">Costo Unitario</th>
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
              {repuestos.map((repuesto) => (
                <tr
                  key={repuesto.id}
                  onClick={() => onViewRepuesto(repuesto)}
                  className="cursor-pointer transition duration-150 ease-in-out"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = tbodyBgColor;
                  }}
                >
                  <td className="p-3">{repuesto.id}</td>
                  <td className="p-3">{repuesto.nombre}</td>
                  <td className="p-3">{repuesto.cantidad}</td>
                  <td className="p-3">${repuesto.costoUnitario}</td>
                </tr>
              ))}
              {repuestos.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron repuestos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && (
          <div
            className="p-4 text-center"
            style={{ color: secondaryTextColor }}
          >
            Cargando...
          </div>
        )}
      </div>
    </div>
  );
};
