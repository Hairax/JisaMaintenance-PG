export class SalidaDetalleResponseDto {
  id: number;
  tipoProducto: 'repuesto' | 'repuesto-maquina';
  productoId: number;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  porcentajeDescuento: number;
  descuentoMonto: number;
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
  descuentoTotal: number;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  detalles: SalidaDetalleResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
