import * as XLSX from 'xlsx';
import { Process } from '../types/process.types';

export function exportProcessToExcel(processes: Process[], fileName = 'procesos.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(processes);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Procesos');
  XLSX.writeFile(workbook, fileName);
}
