export class Salida {
  id: number;
  nroSalida: string;
  usuarioId: number;
  otId: number;
  fecha: Date;
  observacion: string;
  almacen: string;
  subtotal: number;
  total: number;
  detalles: any[];
  alertasStockCritico?: string[];
  createdAt: Date;
  updatedAt: Date;
}
