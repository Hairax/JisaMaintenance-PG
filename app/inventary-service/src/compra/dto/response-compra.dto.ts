export class ResponseCompraDto {
  id: number;
  nroDocumento: string;
  tipoDocumento: string;
  nroFactura: string;
  nit: string;
  proveedorId: number;
  detalle: string;
  almacen: string;
  fecha: Date;
  tipoCambio: number;
  nroAutorizacion: string;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  detalles: any[];
  createdAt: Date;
  updatedAt: Date;
}
