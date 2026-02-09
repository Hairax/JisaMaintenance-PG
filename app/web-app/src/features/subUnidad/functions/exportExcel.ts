import { SubUnidad } from '../types/subUnidad.types';
import * as XLSX from 'xlsx';

export function exportSubUnidadesToExcel(subUnidades: SubUnidad[], fileName = 'subUnidades.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(subUnidades);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SubUnidades');
  XLSX.writeFile(workbook, fileName);
}
