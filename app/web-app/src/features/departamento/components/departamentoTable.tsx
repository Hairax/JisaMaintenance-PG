import React from 'react';
import { Departamento } from '../types/departamento.types';
import { FaPlus } from 'react-icons/fa';

// Paleta de colores (puedes ajustar según tu tema)
const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface DepartamentoTableProps {
  departamentos: Departamento[];
  theme: string;
  onAddDepartamento: () => void;
  onViewDepartamento: (departamento: Departamento) => void;
  loading: boolean;
  error: string | null;
}

export const DepartamentoTable: React.FC<DepartamentoTableProps> = ({
  departamentos,
  theme,
  onAddDepartamento,
  onViewDepartamento,
  loading,
  error,
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

  if (loading && departamentos.length === 0) {
    return (
      <div style={{ color: secondaryTextColor }} className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (error && departamentos.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: textColor }}>
          Departamentos
        </h2>
        <button
          onClick={onAddDepartamento}
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
          <FaPlus /> Agregar Departamento
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
                <th className="p-3 text-left font-semibold">Creado</th>
                <th className="p-3 text-left font-semibold">Actualizado</th>
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
              {departamentos.map((departamento) => (
                <tr
                  key={departamento.id}
                  onClick={() => onViewDepartamento(departamento)}
                  className="cursor-pointer transition duration-150 ease-in-out"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <td className="p-3">{departamento.id}</td>
                  <td className="p-3">{departamento.nombre}</td>
                  <td className="p-3">
                    {new Date(departamento.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {new Date(departamento.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {departamentos.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron departamentos.
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
