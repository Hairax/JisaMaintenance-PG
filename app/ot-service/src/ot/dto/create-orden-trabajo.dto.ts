import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateOrdenTrabajoDto {
  @IsNumber()
  tipoOT_id: number;

  @IsNumber()
  centroCosto_id: number;

  @IsNumber()
  proceso_id: number;

  @IsNumber()
  maquina_id: number;

  @IsOptional()
  @IsNumber()
  subUnidad_id?: number;

  @IsString()
  @IsNotEmpty()
  tipoEjecucion: string; // Ej: 'preventivo' o 'correctivo'

  @IsNumber()
  departamento_id: number;

  @IsNumber()
  objeto_id: number;

  @IsOptional()
  @IsNumber()
  tiempoEstimado?: number;

  @IsNumber()
  supervisor_id: number;

  @IsString()
  @IsNotEmpty()
  descripcionTarea: string;

  @IsDateString()
  fechaHora: Date;

  @IsNumber()
  tipoCambio: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  tecnicos?: number[];
}
