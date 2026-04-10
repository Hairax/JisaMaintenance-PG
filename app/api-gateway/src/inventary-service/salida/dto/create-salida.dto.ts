import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductoSalidaDto {
  @IsNumber()
  repuestoId: number;

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
}

export class CreateSalidaDto {
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
