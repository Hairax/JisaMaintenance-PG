import * as XLSX from 'xlsx';

import { Proveedor } from '../../../shared/types/proveedor.types';

// Mismas columnas que la importación por lote (Código = ID del proveedor)
// más los datos de contacto.
export function exportProveedoresToExcel(
  proveedores: Proveedor[],
  fileName = 'proveedores.xlsx',
) {
  const worksheet = XLSX.utils.json_to_sheet(
    proveedores.map((p) => ({
      Código: p.id,
      Nombre: p.nombre,
      NIT: p.ruc,
      'Correo electrónico': p.correoElectronico,
      Teléfono: p.telefono,
      Dirección: p.direccion,
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores');
  XLSX.writeFile(workbook, fileName);
}
