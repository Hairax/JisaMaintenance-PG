import React from 'react';
import { Process } from '../types/process.types';
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

interface ProcessTableProps {
  processes: Process[];
  centrosCosto: any[];
  theme: string;
  onAddProcess: () => void;
  onViewProcess: (process: Process) => void;
  loading: boolean;
  error: string | null;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({
  processes,
  centrosCosto,
  theme,
  onAddProcess,
  onViewProcess,
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

  if (loading && processes.length === 0) {
    return (
      <div style={{ color: secondaryTextColor }} className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (error && processes.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 style={{ color: textColor }} className="text-2xl font-bold">
          Gestión de Procesos
        </h1>
        <button
          onClick={onAddProcess}
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
          <FaPlus /> Nuevo Proceso
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
                <th className="p-3 text-left font-semibold">Código</th>
                <th className="p-3 text-left font-semibold">Nombre</th>
                <th className="p-3 text-left font-semibold">Centro de Costo</th>
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
              {processes.map((process) => {
                const code = process.correlativo
                  ? `${process.centroCosto}.${String(process.correlativo).padStart(2, '0')}`
                  : `${process.centroCosto}`;
                return (
                  <tr
                    key={process.id}
                    onClick={() => onViewProcess(process)}
                    className="cursor-pointer transition duration-150 ease-in-out"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = hoverBgColor;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                    }}
                  >
                    <td className="p-3">{code}</td>
                    <td className="p-3">{process.name}</td>
                    <td className="p-3">
                      {process.centroCosto} -{' '}
                      {centrosCosto.find((cc) => cc.id === process.centroCosto)
                        ?.name || `ID: ${process.centroCosto}`}
                    </td>
                    <td className="p-3">
                      {process.createdAt instanceof Date
                        ? process.createdAt.toLocaleString()
                        : new Date(process.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {process.updatedAt instanceof Date
                        ? process.updatedAt.toLocaleString()
                        : new Date(process.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {processes.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron procesos.
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
