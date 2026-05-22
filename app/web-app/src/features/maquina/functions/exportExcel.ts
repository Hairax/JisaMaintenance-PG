import { Maquina } from '../types/maquina.types';
import * as XLSX from 'xlsx';

interface ProcessOption {
  id: number;
  name: string;
  correlativo?: number;
}

interface SelectOption {
  id: number;
  name: string;
}

export function exportMaquinasToExcel(
  maquinas: Maquina[],
  procesos: ProcessOption[],
  centrosCosto: SelectOption[],
  proveedores: SelectOption[],
  fileName = 'maquinas.xlsx',
) {
  const rows = maquinas.map((machine) => {
    const proceso = procesos.find(
      (process) => process.id === machine.proceso_id,
    );
    const centroCosto = centrosCosto.find(
      (cc) => cc.id === machine.centroCosto_id,
    );
    const proveedor = proveedores.find(
      (prov) => prov.id === machine.proveedor_id,
    );
    const code =
      machine.centroCosto_id != null &&
      proceso?.correlativo != null &&
      machine.correlativo != null
        ? `${machine.centroCosto_id}.${String(proceso.correlativo).padStart(2, '0')}.${String(
            machine.correlativo,
          ).padStart(2, '0')}`
        : '';

    return {
      Código: code,
      Nombre: machine.name,
      Fabricante: machine.fabricante,
      Tipo: machine.tipoDeMaquina,
      'N° Serie': machine.numeroDeSerie,
      'Centro de Costo': centroCosto?.name || machine.centroCosto_id,
      Proceso: proceso?.name || machine.proceso_id,
      Proveedor: proveedor?.name || machine.proveedor_id,
      Correlativo: machine.correlativo ?? '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Maquinas');
  XLSX.writeFile(workbook, fileName);
}
