import { OrdenTrabajo } from '../types/ot.types';
import * as XLSX from 'xlsx';

export function exportOtsToExcel(ots: OrdenTrabajo[], fileName = 'ordenes_trabajo.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(ots);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'OrdenesTrabajo');
  XLSX.writeFile(workbook, fileName);
}
