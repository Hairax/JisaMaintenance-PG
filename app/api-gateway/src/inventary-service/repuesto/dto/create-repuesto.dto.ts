import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreateRepuestoDto {
  @IsEnum(['NORMAL', 'LIBRE'])
  tipo: string;

  @IsString()
  @IsOptional()
  codigoPersonalizado?: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  uMedida?: string;

  @IsString()
  @IsOptional()
  numeroDeParte?: string;

  @IsString()
  @IsOptional()
  ubicacion?: string;

  @IsString()
  @IsOptional()
  especificacion?: string;

  @IsNumber()
  @Min(0)
  costoUnitario: number;

  @IsInt()
  @Min(0)
  cantidad: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stockCritico?: number;

  @IsBoolean()
  @IsOptional()
  contable?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  correlativo?: number;

  @IsInt()
  @IsOptional()
  centroCosto_id?: number;

  @IsInt()
  @IsOptional()
  proceso_id?: number;

  @IsInt()
  @IsOptional()
  maquina_id?: number;

  @IsInt()
  @IsOptional()
  subUnidad_id?: number;
}
