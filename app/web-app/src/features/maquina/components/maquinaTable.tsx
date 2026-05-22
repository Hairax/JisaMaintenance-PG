import React from 'react';
import { Maquina } from '../types/maquina.types';
import { ProcessOption, SelectOption } from '../hooks/useMaquina'; // Asegúrate de importar SelectOption
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

interface MaquinaTableProps {
  maquinas: Maquina[];
  procesos: ProcessOption[];
  centrosCosto: SelectOption[]; // Agregamos la lista de centros de costo
  proveedores: SelectOption[]; // Agregamos la lista de proveedores
  theme: string;
  loading: boolean;
  error: string | null;
  onAddMaquina: () => void;
  onViewMaquina: (maquina: Maquina) => void;
}

export const MaquinaTable: React.FC<MaquinaTableProps> = ({
  maquinas,
  procesos,
  centrosCosto,
  proveedores,
  theme,
  loading,
  error,
  onAddMaquina,
  onViewMaquina,
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

  // Función para construir el código de la máquina
  const buildMachineCode = (machine: Maquina) => {
    const centroCosto = machine.centroCosto_id;
    const procesoId = machine.proceso_id;
    const correlativo = machine.correlativo;

    if (!centroCosto || !procesoId || !correlativo) return undefined;

    const proceso = procesos.find((process) => process.id === procesoId);
    const procesoCorrelativo = proceso?.correlativo;

    if (procesoCorrelativo === undefined || procesoCorrelativo === null)
      return undefined;

    return `${centroCosto}.${String(procesoCorrelativo).padStart(2, '0')}.${String(
      correlativo,
    ).padStart(2, '0')}`;
  };

  // Función para formatear el Centro de Costo como "ID - Nombre"
  const formatCentroCosto = (id: number) => {
    const centro = centrosCosto.find((cc) => cc.id === id);
    return centro ? `${id} - ${centro.name}` : `ID: ${id}`;
  };

  // Función para formatear el Proveedor como "ID - Nombre"
  const formatProveedor = (id: number) => {
    const proveedor = proveedores.find((p) => p.id === id);
    return proveedor ? `${id} - ${proveedor.name}` : `ID: ${id}`;
  };

  if (loading && maquinas.length === 0) {
    return (
      <div style={{ color: secondaryTextColor }} className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  if (error && maquinas.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: textColor }}>
          Máquinas
        </h2>
        <button
          onClick={onAddMaquina}
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
          <FaPlus /> Agregar Máquina
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
                <th className="p-3 text-left font-semibold">Codigo</th>
                <th className="p-3 text-left font-semibold">Nombre</th>
                <th className="p-3 text-left font-semibold">Fabricante</th>
                <th className="p-3 text-left font-semibold">Tipo</th>
                <th className="p-3 text-left font-semibold">N° Serie</th>
                <th className="p-3 text-left font-semibold">Centro Costo</th>
                <th className="p-3 text-left font-semibold">Proveedor</th>
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
              {maquinas.map((maquina) => (
                <tr
                  key={maquina.id}
                  onClick={() => onViewMaquina(maquina)}
                  className="cursor-pointer transition duration-150 ease-in-out"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = tbodyBgColor;
                  }}
                >
                  <td className="p-3 font-medium">
                    {buildMachineCode(maquina) || `ID: ${maquina.id}`}
                  </td>
                  <td className="p-3">{maquina.name}</td>
                  <td className="p-3">{maquina.fabricante}</td>
                  <td className="p-3">{maquina.tipoDeMaquina}</td>
                  <td className="p-3">{maquina.numeroDeSerie}</td>
                  {/* Cambiados para mostrar "ID - Nombre" */}
                  <td className="p-3">
                    {formatCentroCosto(maquina.centroCosto_id)}
                  </td>
                  <td className="p-3">
                    {formatProveedor(maquina.proveedor_id)}
                  </td>
                </tr>
              ))}
              {maquinas.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ color: secondaryTextColor }}
                    className="p-4 text-center"
                  >
                    No se encontraron máquinas.
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
