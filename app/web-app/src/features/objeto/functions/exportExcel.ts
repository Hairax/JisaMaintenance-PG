import * as XLSX from 'xlsx';

export function exportExcel(data: any[], fileName: string = 'objetos.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Objetos');
  XLSX.writeFile(workbook, fileName);
}
