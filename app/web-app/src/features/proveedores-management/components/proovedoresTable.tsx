import React from 'react';
import { Proveedor } from '../../../shared/types/proveedor.types';
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

interface ProveedoresTableProps {
  proveedores: Proveedor[];
  theme: string;
  onAddProveedor: () => void;
  onViewProveedor: (proveedor: Proveedor) => void;
  loading: boolean;
  error: string | null;
}

export const ProveedoresTable: React.FC<ProveedoresTableProps> = ({
  proveedores,
  theme,
  onAddProveedor,
  onViewProveedor,
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

  if (loading && proveedores.length === 0) {
    return (
      <div style={{ color: secondaryTextColor }} className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (error && proveedores.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 style={{ color: textColor }} className="text-2xl font-bold">
          Gestión de Proveedores
        </h1>
        <button
          onClick={onAddProveedor}
          style={{
            backgroundColor: buttonBgColor,
            color: colors.darkText,
          }}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg shadow transition duration-150 ease-in-out"
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = buttonHoverColor;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = buttonBgColor;
          }}
        >
          <FaPlus /> Nuevo Proveedor
        </button>
      </div>

      {error && !loading && (
        <div className="mb-4 text-center text-red-500">{error}</div>
      )}

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
                <th className="p-3 text-left font-semibold">RUC</th>
                <th className="p-3 text-left font-semibold">Correo</th>
                <th className="p-3 text-left font-semibold">Teléfono</th>
                <th className="p-3 text-left font-semibold">Dirección</th>
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
              {proveedores.map((proveedor) => (
                <tr
                  key={proveedor.id}
                  onClick={() => onViewProveedor(proveedor)}
                  className="cursor-pointer transition duration-150 ease-in-out"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = tbodyBgColor;
                  }}
                >
                  <td className="p-3">{proveedor.id}</td>
                  <td className="p-3">{proveedor.nombre}</td>
                  <td className="p-3">{proveedor.ruc}</td>
                  <td className="p-3">{proveedor.correoElectronico}</td>
                  <td className="p-3">{proveedor.telefono}</td>
                  <td className="p-3">{proveedor.direccion}</td>
                </tr>
              ))}
              {proveedores.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron proveedores.
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
