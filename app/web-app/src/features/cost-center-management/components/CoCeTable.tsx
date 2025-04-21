import React from 'react';
import { CostCenter } from '../../../shared/types/cost-center.types';
import { FaPlus } from 'react-icons/fa';

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

interface CoCeTableProps {
  costCenters: CostCenter[];
  theme: string;
  onAddCostCenter: () => void;
  onViewCostCenter: (costCenter: CostCenter) => void;
  loading: boolean;
  error: string | null;
}

export const CoCeTable: React.FC<CoCeTableProps> = ({
  costCenters,
  theme,
  onAddCostCenter,
  onViewCostCenter,
  loading,
  error,
}) => {
  // Colores basados en el tema
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const hoverBgColor = theme === 'dark' ? '#2A2A2A' : '#D6D6D6';
  const theadBgColor = theme === 'dark' ? colors.brown : colors.beige;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const tbodyBgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const buttonBgColor = colors.gold;
  const buttonHoverColor = '#E69D00'; // Versión ligeramente oscurecida del gold

  if (loading && costCenters.length === 0) {
    return (
      <div style={{ color: secondaryTextColor }} className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (error && costCenters.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: textColor }}>
          Centros de Costos
        </h2>
        <button
          onClick={onAddCostCenter}
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
          <FaPlus /> Agregar Centro de Costo
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
              {costCenters.map((costCenter) => (
                <tr
                  key={costCenter.id}
                  onClick={() => onViewCostCenter(costCenter)}
                  className="cursor-pointer transition duration-150 ease-in-out"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                >
                  <td className="p-3">{costCenter.id}</td>
                  <td className="p-3">{costCenter.name}</td>
                </tr>
              ))}
              {costCenters.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron centros de costo.
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
