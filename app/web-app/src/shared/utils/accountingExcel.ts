// Exports para contabilidad que deben calzar EXACTO con plantillas externas
// (columnas, orden y estilo de encabezado) — por eso usamos exceljs acá en
// vez de la librería `xlsx` que ya usa el resto de la app: `xlsx` (edición
// community) no puede escribir estilos de celda, solo exceljs lo hace.
//
// exceljs se carga con import() dinámico (no en el bundle principal): pesa
// ~275KB gzip y solo lo usan unos pocos botones de export, no tiene sentido
// que lo descargue todo el mundo en cada carga de la app.

const HEADER_FONT = { name: 'Aptos Narrow', size: 11 };

export async function exportStyledExcel({
  filename,
  sheetName,
  headers,
  columnWidths,
  rows,
}: {
  filename: string;
  sheetName: string;
  headers: string[];
  columnWidths: number[];
  rows: (string | number)[][];
}) {
  const ExcelJS = (await import('exceljs')).default;
  const HEADER_FILL: import('exceljs').Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFB0C4DE' },
  };

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = headers.map((_, i) => ({ width: columnWidths[i] ?? 12 }));

  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
  });

  for (const row of rows) {
    sheet.addRow(row);
  }

  await descargarWorkbook(workbook, filename);
}

export async function descargarWorkbook(
  workbook: import('exceljs').Workbook,
  filename: string,
) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
