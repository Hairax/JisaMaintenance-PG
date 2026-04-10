export class SalidaDetalleResponseDto {
  id: number;
  tipoProducto: 'repuesto' | 'repuesto-maquina';
  repuestoId: number;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  subtotal: number;
}

export class ResponseSalidaDto {
  id: number;
  nroSalida: string;
  usuarioId: number;
  otId: number;
  fecha: Date;
  observacion: string;
  almacen: string;
  subtotal: number;
  total: number;
  detalles: SalidaDetalleResponseDto[];
  alertasStockCritico?: string[];
  createdAt: Date;
  updatedAt: Date;
}
