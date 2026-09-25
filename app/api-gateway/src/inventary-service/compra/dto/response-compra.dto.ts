import { CompraDetalle } from '../entities/compra.entity';

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
  usuarioId: number;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  detalles: CompraDetalle[];
  createdAt: Date;
  updatedAt: Date;
}
