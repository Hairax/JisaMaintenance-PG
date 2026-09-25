import { IsString, IsNumber, IsOptional } from 'class-validator';

export class ProductoCompraDto {
  @IsNumber()
  @IsOptional()
  repuestoId?: number;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  nombre: string;

  @IsString()
  unidadMedida: string;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;

  @IsNumber()
  @IsOptional()
  porcentajeDescuento?: number;

  @IsNumber()
  @IsOptional()
  porcentajeImpuesto?: number;
}

export class CreateCompraDto {
  @IsString()
  nroDocumento: string;

  @IsString()
  tipoDocumento: 'Factura' | 'Documento';

  @IsString()
  nroFactura: string;

  @IsString()
  nit: string;

  @IsNumber()
  proveedorId: number;

  @IsString()
  detalle: string;

  @IsString()
  almacen: string;

  fecha: Date;

  @IsNumber()
  @IsOptional()
  tipoCambio?: number;

  @IsString()
  @IsOptional()
  nroAutorizacion?: string;

  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  detalles: ProductoCompraDto[];
}
