import React from 'react';
import { RepuestoMaquina } from '../types/repuestoMaquina.types';

// Paleta de colores igual que user-management
const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface RepuestoMaquinaTableProps {
  repuestos: RepuestoMaquina[];
  loading: boolean;
  onView: (repuesto: RepuestoMaquina) => void;
  theme: string;
}

export const RepuestoMaquinaTable: React.FC<RepuestoMaquinaTableProps> = ({
  repuestos,
  loading,
  onView,
  theme,
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
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-12">
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
                <th className="p-3 text-left font-semibold">ID Máquina</th>
                <th className="p-3 text-left font-semibold">ID SubUnidad</th>
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
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center"
                    style={{ color: secondaryTextColor }}
                  >
                    Cargando...
                  </td>
                </tr>
              ) : repuestos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center"
                    style={{ color: secondaryTextColor }}
                  >
                    No hay repuestos registrados.
                  </td>
                </tr>
              ) : (
                repuestos.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer transition duration-150 ease-in-out"
                    onClick={() => onView(r)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = hoverBgColor;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                    }}
                  >
                    <td className="p-3">{r.id}</td>
                    <td className="p-3">{r.nombre}</td>
                    <td className="p-3">{r.cantidad}</td>
                    <td className="p-3">{r.costoUnitario}</td>
                    <td className="p-3">{r.maquina_id}</td>
                    <td className="p-3">{r.subUnidad_id ?? 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
