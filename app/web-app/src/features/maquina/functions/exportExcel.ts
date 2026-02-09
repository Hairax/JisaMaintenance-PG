import { Maquina } from '../types/maquina.types';
import * as XLSX from 'xlsx';

export function exportMaquinasToExcel(maquinas: Maquina[], fileName = 'maquinas.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(maquinas);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Maquinas');
  XLSX.writeFile(workbook, fileName);
}
