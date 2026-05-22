import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class UpdateRepuestoDto {
  @IsEnum(['NORMAL', 'LIBRE'])
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  codigoPersonalizado?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(['PZA', 'KG', 'LT', 'MT', 'GL', 'UN', 'JGO'])
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
  @IsOptional()
  costoUnitario?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  cantidad?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stockCritico?: number;

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
