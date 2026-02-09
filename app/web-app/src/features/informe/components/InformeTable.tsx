import React from 'react';
import { InformeDiarioTrabajo } from '../types/informe.types';

interface InformeTableProps {
  informes: InformeDiarioTrabajo[];
  theme: string;
  onAddInforme: () => void;
  onViewInforme: (informe: InformeDiarioTrabajo) => void;
  loading: boolean;
  error: string | null;
}

export const InformeTable: React.FC<InformeTableProps> = ({
  informes,
  theme,
  onAddInforme,
  onViewInforme,
  loading,
  error,
}) => {
  // Colores y estilos base (puedes ajustar según user-management)
  const textColor = theme === 'dark' ? '#FFFFFF' : '#000000';
  const secondaryTextColor = theme === 'dark' ? '#E1CD9B' : '#9E5533';
  const bgColor = theme === 'dark' ? '#1A1A1A' : '#E6E6E6';
  const hoverBgColor = theme === 'dark' ? '#2A2A2A' : '#D6D6D6';
  const theadBgColor = theme === 'dark' ? '#9E5533' : '#E1CD9B';
  const theadTextColor = theme === 'dark' ? '#FFFFFF' : '#000000';
  const tbodyBgColor = theme === 'dark' ? '#1A1A1A' : '#E6E6E6';
  const buttonBgColor = '#FBAF11';
  const buttonHoverColor = '#E69D00';

  if (loading && informes.length === 0) {
    return (
      <div style={{ color: secondaryTextColor }} className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (error && informes.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: textColor }}>
          Informes Diarios
        </h2>
        <button
          onClick={onAddInforme}
          style={{ backgroundColor: buttonBgColor, color: '#FFFFFF' }}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg shadow transition duration-150 ease-in-out"
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = buttonHoverColor;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = buttonBgColor;
          }}
        >
          + Nuevo Informe
        </button>
      </div>
      <div
        style={{ backgroundColor: bgColor }}
        className="shadow-md rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead
              style={{ backgroundColor: theadBgColor, color: theadTextColor }}
            >
              <tr>
                <th className="p-3 text-left font-semibold">ID</th>
                <th className="p-3 text-left font-semibold">Técnico</th>
                <th className="p-3 text-left font-semibold">Fecha</th>
                <th className="p-3 text-left font-semibold">Observaciones</th>
              </tr>
            </thead>
            <tbody
              style={{ backgroundColor: tbodyBgColor, color: textColor }}
              className="divide-y"
            >
              {informes.map((inf) => (
                <tr
                  key={inf.id}
                  onClick={() => onViewInforme(inf)}
                  className="cursor-pointer transition duration-150 ease-in-out"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = tbodyBgColor;
                  }}
                >
                  <td className="p-3">{inf.id}</td>
                  <td className="p-3">{inf.tecnico_id}</td>
                  <td className="p-3">
                    {typeof inf.fechaTrabajo === 'string'
                      ? inf.fechaTrabajo.split('T')[0]
                      : ((inf.fechaTrabajo as Date)?.toLocaleDateString?.() ??
                        '')}
                  </td>
                  <td className="p-3">{inf.observaciones ?? '-'}</td>
                </tr>
              ))}
              {informes.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron informes diarios.
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
