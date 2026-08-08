import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
export type FrecuenciaUnidad = 'dias' | 'semanas' | 'meses';

export class CreateProgramacionOtDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsNumber()
  maquina_id: number;

  @IsOptional()
  @IsNumber()
  subUnidad_id?: number;

  @IsNumber()
  centroCosto_id: number;

  @IsNumber()
  proceso_id: number;

  @IsNumber()
  tipoOT_id: number;

  @IsNumber()
  departamento_id: number;

  @IsNumber()
  objeto_id: number;

  @IsNumber()
  supervisor_id: number;

  @IsOptional()
  @IsString()
  tipoEjecucion?: string;

  @IsString()
  @IsNotEmpty()
  descripcionTarea: string;

  @IsOptional()
  @IsString()
  indicacionesEspeciales?: string;

  @IsOptional()
  @IsNumber()
  tiempoEstimado?: number;

  @IsInt()
  @Min(1)
  frecuenciaValor: number;

  @IsIn(['dias', 'semanas', 'meses'])
  frecuenciaUnidad: FrecuenciaUnidad;

  @IsDateString()
  fechaInicio: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
