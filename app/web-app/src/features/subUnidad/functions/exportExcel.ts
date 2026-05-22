import { SubUnidad } from '../types/subUnidad.types';
import * as XLSX from 'xlsx';

interface ProcessOption {
  id: number;
  name: string;
  correlativo?: number;
}

interface MachineOption {
  id: number;
  name: string;
  centroCosto: number;
  proceso: number;
  correlativo?: number;
}

interface SelectOption {
  id: number;
  name: string;
}

export function exportSubUnidadesToExcel(
  subUnidades: SubUnidad[],
  procesos: ProcessOption[],
  maquinas: MachineOption[],
  centrosCosto: SelectOption[],
  fileName = 'subUnidades.xlsx',
) {
  const rows = subUnidades.map((subUnidad) => {
    const machine = maquinas.find((m) => m.id === subUnidad.maquina_id);
    const proceso = procesos.find((p) => p.id === machine?.proceso);
    const centroCosto = centrosCosto.find(
      (cc) => cc.id === machine?.centroCosto,
    );
    const code =
      machine &&
      proceso?.correlativo != null &&
      machine.correlativo != null &&
      subUnidad.correlativo != null
        ? `${machine.centroCosto}.${String(proceso.correlativo).padStart(2, '0')}.${String(
            machine.correlativo,
          ).padStart(2, '0')}.${String(subUnidad.correlativo).padStart(2, '0')}`
        : '';

    return {
      Código: code,
      Descripción: subUnidad.descripcion,
      'Centro de Costo': centroCosto?.name || machine?.centroCosto || '',
      Proceso: proceso?.name || machine?.proceso || '',
      Máquina: machine?.name || subUnidad.maquina_id,
      Correlativo: subUnidad.correlativo ?? '',
      Creado: subUnidad.createdAt,
      Actualizado: subUnidad.updatedAt,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SubUnidades');
  XLSX.writeFile(workbook, fileName);
}
