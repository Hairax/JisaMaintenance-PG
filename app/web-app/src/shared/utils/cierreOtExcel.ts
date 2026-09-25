// Excel de cierre mensual de OTs, con el formato del "Cuadro resumen de
// órdenes de trabajo" que usa contabilidad (Proceso OT_<MES>.xlsx):
// título + periodo, una fila por OT con sus códigos y costos, y una fila
// final de totales. Por pedido de contabilidad no se incluye TOT_MAQ, y los
// repuestos van solo como TOT_REP (el sistema no distingue T_REPC / T_REPS).
//
// Con detalle, debajo de cada OT se listan los repuestos consumidos. Esas
// filas no llevan NUM_OT, y los totales suman solo filas con NUM_OT, así el
// costo de repuestos no se cuenta dos veces.

import { descargarWorkbook } from './accountingExcel';

export interface CierreOtRepuesto {
  fecha: Date | null;
  nroSalida: string;
  codigo: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  importe: number;
}

export interface CierreOtFila {
  numOt: string;
  tipoOt: number | string;
  fechaOt: Date | null;
  fechaFin: Date | null;
  codCentroCosto: number | string;
  codProceso: number | string;
  codMaquina: number | string;
  codElemento: number | string;
  centroCosto: string;
  proceso: string;
  maquina: string;
  descripcion: string;
  totManoObra: number;
  totRepuestos: number;
  repuestos: CierreOtRepuesto[];
}

const HEADERS = [
  'NUM_OT',
  'TIPO_OT',
  'FECHA O.T.',
  'FECHA FIN',
  'C.C',
  'COD_PRO',
  'COD_MAQ',
  'COD_ELE',
  'C.DE COSTO',
  'PROCESO',
  'MAQUINA',
  'DESCRIPCION DE O.T.',
  'TOT_MOBRA',
  'TOT_REP',
  'TOTAL',
];
const WIDTHS = [11, 9, 11, 11, 6, 9, 9, 9, 30, 30, 30, 46, 14, 14, 14];
const COL_NUM_OT = 1;
const COL_FECHA_OT = 3;
const COL_DESCRIPCION = 12;
const COL_MOBRA = 13;
const COL_REP = 14;
const COL_TOTAL = 15;
const HEADER_ROW = 6;
const FMT_MONEDA = '#,##0.00';
const FMT_FECHA = 'dd/mm/yyyy';

const fmtFecha = (d: Date) =>
  d.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

// exceljs escribe las fechas en UTC: se pasa la fecha local como medianoche
// UTC para que Excel muestre el mismo día que ve el usuario.
const soloFecha = (d: Date | null) =>
  d && !isNaN(d.getTime())
    ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    : null;

const colLetra = (c: number) => String.fromCharCode(64 + c);

export async function exportCierreOtExcel({
  filename,
  desde,
  hasta,
  filas,
  conDetalle,
}: {
  filename: string;
  desde: Date;
  hasta: Date;
  filas: CierreOtFila[];
  conDetalle: boolean;
}) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Hoja1', {
    views: [{ state: 'frozen', ySplit: HEADER_ROW }],
  });
  sheet.columns = WIDTHS.map((width) => ({ width }));

  sheet.getCell('B3').value = 'CUADRO RESUMEN DE ORDENES DE TRABAJO';
  sheet.getCell('B4').value =
    `PERIODO DEL: ${fmtFecha(desde)} AL: ${fmtFecha(hasta)}`;
  sheet.getCell('B3').font = { bold: true, size: 12 };
  sheet.getCell('B4').font = { bold: true };

  const header = sheet.getRow(HEADER_ROW);
  header.values = HEADERS;
  header.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB0C4DE' },
    };
    cell.border = { bottom: { style: 'thin' } };
    cell.alignment = { vertical: 'middle' };
  });

  let rowIdx = HEADER_ROW;
  for (const f of filas) {
    rowIdx++;
    const row = sheet.getRow(rowIdx);
    row.values = [
      f.numOt,
      f.tipoOt,
      soloFecha(f.fechaOt),
      soloFecha(f.fechaFin),
      f.codCentroCosto,
      f.codProceso,
      f.codMaquina,
      f.codElemento,
      f.centroCosto,
      f.proceso,
      f.maquina,
      f.descripcion,
      round2(f.totManoObra),
      round2(f.totRepuestos),
      round2(f.totManoObra + f.totRepuestos),
    ];
    if (conDetalle) row.font = { bold: true };

    if (!conDetalle) continue;
    for (const r of f.repuestos) {
      rowIdx++;
      const det = sheet.getRow(rowIdx);
      det.getCell(COL_FECHA_OT).value = soloFecha(r.fecha);
      det.getCell(COL_DESCRIPCION).value =
        `   Salida #${r.nroSalida} · [${r.codigo}] ${r.nombre} — ` +
        `${r.cantidad} ${r.unidad} × ${r.precioUnitario.toFixed(2)}`;
      det.getCell(COL_REP).value = round2(r.importe);
      det.font = { italic: true, size: 10, color: { argb: 'FF555555' } };
    }
  }
  const ultimaFila = rowIdx;

  // Formatos de columna para todas las filas de datos.
  for (let r = HEADER_ROW + 1; r <= ultimaFila; r++) {
    const row = sheet.getRow(r);
    row.getCell(COL_FECHA_OT).numFmt = FMT_FECHA;
    row.getCell(COL_FECHA_OT + 1).numFmt = FMT_FECHA;
    for (const c of [COL_MOBRA, COL_REP, COL_TOTAL]) {
      row.getCell(c).numFmt = FMT_MONEDA;
    }
  }

  // Fila de totales (con una fila en blanco de separación). SUMIF sobre
  // NUM_OT no vacío: solo suma las filas de OT, nunca las de detalle.
  const totalRow = sheet.getRow(ultimaFila + 2);
  totalRow.getCell(COL_DESCRIPCION).value = 'TOTALES';
  totalRow.getCell(COL_DESCRIPCION).alignment = { horizontal: 'right' };
  const sumas: Record<number, number> = {
    [COL_MOBRA]: filas.reduce((s, f) => s + round2(f.totManoObra), 0),
    [COL_REP]: filas.reduce((s, f) => s + round2(f.totRepuestos), 0),
    [COL_TOTAL]: filas.reduce(
      (s, f) => s + round2(f.totManoObra + f.totRepuestos),
      0,
    ),
  };
  const desdeFila = HEADER_ROW + 1;
  const numOt = colLetra(COL_NUM_OT);
  for (const c of [COL_MOBRA, COL_REP, COL_TOTAL]) {
    const col = colLetra(c);
    const cell = totalRow.getCell(c);
    cell.value =
      filas.length > 0
        ? {
            formula: `SUMIF(${numOt}${desdeFila}:${numOt}${ultimaFila},"<>",${col}${desdeFila}:${col}${ultimaFila})`,
            result: round2(sumas[c]),
          }
        : 0;
    cell.numFmt = FMT_MONEDA;
    cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } };
  }
  totalRow.font = { bold: true };

  if (filas.length > 0) {
    sheet.autoFilter = {
      from: { row: HEADER_ROW, column: 1 },
      to: { row: ultimaFila, column: HEADERS.length },
    };
  }

  await descargarWorkbook(workbook, filename);
}

function round2(n: number) {
  return Math.round((Number(n) || 0) * 100) / 100;
}
