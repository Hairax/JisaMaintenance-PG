import { TipoMantenimiento } from '../types/tipoMantenimiento.types';
import * as XLSX from 'xlsx';

export function exportTipoMantenimientoToExcel(
  tipos: TipoMantenimiento[],
  fileName = 'tipos-mantenimiento.xlsx',
) {
  const worksheet = XLSX.utils.json_to_sheet(tipos);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'TiposMantenimiento');
  XLSX.writeFile(workbook, fileName);
}
