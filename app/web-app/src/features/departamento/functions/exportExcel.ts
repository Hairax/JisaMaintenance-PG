import * as XLSX from 'xlsx';
import { Departamento } from '../types/departamento.types';

export function exportDepartamentoExcel(departamentos: Departamento[]) {
  const worksheet = XLSX.utils.json_to_sheet(departamentos);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Departamentos');
  XLSX.writeFile(workbook, 'departamentos.xlsx');
}
