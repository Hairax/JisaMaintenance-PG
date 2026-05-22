import React from 'react';
import { SubUnidad } from '../types/subUnidad.types';
import { FaPlus } from 'react-icons/fa';

export interface SelectOption {
  id: number;
  name: string;
}

export interface ProcessOption extends SelectOption {
  centroCosto: number;
  correlativo?: number;
}

export interface MachineOption extends SelectOption {
  centroCosto: number;
  proceso: number;
  correlativo?: number;
}

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface SubUnidadTableProps {
  subUnidades: SubUnidad[];
  centrosCosto: SelectOption[];
  procesos: ProcessOption[];
  maquinas: MachineOption[];
  theme: string;
  onAddSubUnidad: () => void;
  onViewSubUnidad: (subUnidad: SubUnidad) => void;
  loading: boolean;
  error: string | null;
}

export const SubUnidadTable: React.FC<SubUnidadTableProps> = ({
  subUnidades,
  centrosCosto,
  procesos,
  maquinas,
  theme,
  onAddSubUnidad,
  onViewSubUnidad,
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

  if (loading && subUnidades.length === 0) {
    return (
      <div style={{ color: secondaryTextColor }} className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (error && subUnidades.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 style={{ color: textColor }} className="text-2xl font-bold">
          SubUnidades
        </h1>
        <button
          onClick={onAddSubUnidad}
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
          <FaPlus /> Nueva SubUnidad
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
                <th className="p-3 text-left font-semibold">Código</th>
                <th className="p-3 text-left font-semibold">Descripción</th>
                <th className="p-3 text-left font-semibold">Máquina</th>
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
              {subUnidades.map((subUnidad) => {
                const machine = maquinas.find(
                  (m) => m.id === subUnidad.maquina_id,
                );
                const process = procesos.find((p) => p.id === machine?.proceso);
                const code =
                  machine &&
                  process &&
                  subUnidad.correlativo != null &&
                  process.correlativo != null &&
                  machine.correlativo != null
                    ? `${machine.centroCosto}.${String(
                        process.correlativo,
                      ).padStart(2, '0')}.${String(
                        machine.correlativo,
                      ).padStart(2, '0')}.${String(
                        subUnidad.correlativo,
                      ).padStart(2, '0')}`
                    : `ID ${subUnidad.id}`;

                return (
                  <tr
                    key={subUnidad.id}
                    onClick={() => onViewSubUnidad(subUnidad)}
                    className="cursor-pointer transition duration-150 ease-in-out"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = hoverBgColor;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                    }}
                  >
                    <td className="p-3">{code}</td>
                    <td className="p-3">{subUnidad.descripcion}</td>
                    <td className="p-3">
                      {machine?.name || subUnidad.maquina_id}
                    </td>
                    <td className="p-3">{subUnidad.createdAt}</td>
                    <td className="p-3">{subUnidad.updatedAt}</td>
                  </tr>
                );
              })}
              {subUnidades.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron subunidades.
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
