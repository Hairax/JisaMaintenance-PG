export class Salida {
  id: number;
  nroSalida: string;
  usuarioId: number;
  otId: number;
  fecha: Date;
  observacion: string;
  almacen: string;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  detalles: any[];
  createdAt: Date;
  updatedAt: Date;
}
