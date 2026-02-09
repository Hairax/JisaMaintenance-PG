import { RepuestoMaquina } from '../types/repuestoMaquina.types';
import * as XLSX from 'xlsx';

export function exportRepuestosToExcel(repuestos: RepuestoMaquina[], fileName = 'repuestos-maquina.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(repuestos);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Repuestos');
  XLSX.writeFile(workbook, fileName);
}
