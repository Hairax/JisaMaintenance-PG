import * as XLSX from 'xlsx';

export function exportCostCentersToExcel(
  costCenters: unknown[],
  fileName = 'cost-centers.xlsx',
) {
  const worksheet = XLSX.utils.json_to_sheet(costCenters);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CostCenters');
  XLSX.writeFile(workbook, fileName);
}
