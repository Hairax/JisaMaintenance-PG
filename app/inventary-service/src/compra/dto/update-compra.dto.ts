import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ProductoCompraDto } from './create-compra.dto';

export class UpdateCompraDto {
  @IsString()
  @IsOptional()
  nroDocumento?: string;

  @IsString()
  @IsOptional()
  tipoDocumento?: string;

  @IsString()
  @IsOptional()
  nroFactura?: string;

  @IsString()
  @IsOptional()
  nit?: string;

  @IsNumber()
  @IsOptional()
  proveedorId?: number;

  @IsString()
  @IsOptional()
  detalle?: string;

  @IsString()
  @IsOptional()
  almacen?: string;

  @IsOptional()
  fecha?: Date;

  @IsNumber()
  @IsOptional()
  tipoCambio?: number;

  @IsString()
  @IsOptional()
  nroAutorizacion?: string;

  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  @IsArray()
  @IsOptional()
  detalles?: ProductoCompraDto[];
}
