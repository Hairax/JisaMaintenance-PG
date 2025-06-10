import React from 'react';
import { TipoMantenimiento } from '../types/tipoMantenimiento.types';

// Paleta de colores (puedes importar si ya la tienes en otro archivo)
const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface TipoMantenimientoTableProps {
  tiposMantenimiento: TipoMantenimiento[];
  loading: boolean;
  error: string | null;
  theme?: string;
  onView: (tipo: TipoMantenimiento) => void;
  onEdit: (tipo: TipoMantenimiento) => void;
  onDelete: (tipo: TipoMantenimiento) => void;
}

export const TipoMantenimientoTable: React.FC<TipoMantenimientoTableProps> = ({
  tiposMantenimiento,
  loading,
  error,
  theme = 'light',
  onView,
}) => {
  // Colores basados en el tema
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const theadBgColor = theme === 'dark' ? colors.brown : colors.beige;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const tbodyBgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const hoverBgColor = theme === 'dark' ? '#2A2A2A' : '#D6D6D6';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
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
              {tiposMantenimiento.map((tipo) => (
                <tr
                  key={tipo.id}
                  onClick={() => onView(tipo)}
                  style={{ cursor: 'pointer' }}
                  className="transition duration-150 ease-in-out"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <td className="p-3">{tipo.id}</td>
                  <td className="p-3">{tipo.nombre}</td>
                  <td className="p-3">{tipo.createdAt}</td>
                  <td className="p-3">{tipo.updatedAt}</td>
                </tr>
              ))}
              {tiposMantenimiento.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron tipos de mantenimiento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <div className="p-4 text-center text-gray-500">Cargando...</div>
          )}
        </div>
      </div>
    </div>
  );
};
