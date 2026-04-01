import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductoSalidaDto {
  @IsEnum(['repuesto', 'repuesto-maquina'])
  tipoProducto: 'repuesto' | 'repuesto-maquina';

  @IsNumber()
  productoId: number;

  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  unidadMedida: string;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;

  @IsOptional()
  @IsNumber()
  porcentajeDescuento?: number;
}

export class CreateSalidaDto {
  @IsString()
  nroSalida: string;

  @IsNumber()
  usuarioId: number;

  @IsNumber()
  otId: number;

  @IsDate()
  @Type(() => Date)
  fecha: Date;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsString()
  almacen?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoSalidaDto)
  detalles: ProductoSalidaDto[];
}
