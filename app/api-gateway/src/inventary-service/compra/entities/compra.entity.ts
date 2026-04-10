export class Compra {
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
  detalles: CompraDetalle[];
  createdAt: Date;
  updatedAt: Date;
}

export class CompraDetalle {
  id: number;
  compraId: number;
  repuestoId?: number;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  porcentajeDescuento: number;
  descuentoMonto: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}
