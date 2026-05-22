import * as XLSX from 'xlsx';
import { Process } from '../types/process.types';

export function exportProcessToExcel(
  processes: Process[],
  fileName = 'procesos.xlsx',
) {
  const rows = processes.map((process) => ({
    Código:
      process.correlativo != null
        ? `${process.centroCosto}.${String(process.correlativo).padStart(2, '0')}`
        : String(process.centroCosto),
    Nombre: process.name,
    'Centro de Costo': process.centroCosto,
    Correlativo: process.correlativo ?? '',
    Creado: process.createdAt,
    Actualizado: process.updatedAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Procesos');
  XLSX.writeFile(workbook, fileName);
}
