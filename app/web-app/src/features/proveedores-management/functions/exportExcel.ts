import * as XLSX from 'xlsx';

import { Proveedor } from '../../../shared/types/proveedor.types';

export function exportProveedoresToExcel(
  proveedores: Proveedor[],
  fileName = 'proveedores.xlsx',
) {
  const worksheet = XLSX.utils.json_to_sheet(proveedores);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores');
  XLSX.writeFile(workbook, fileName);
}
