import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class UpdateOrdenTrabajoDto {
  @IsOptional()
  @IsNumber()
  tipoOT_id?: number;

  @IsOptional()
  @IsNumber()
  centroCosto_id?: number;

  @IsOptional()
  @IsNumber()
  proceso_id?: number;

  @IsOptional()
  @IsNumber()
  maquina_id?: number;

  @IsOptional()
  @IsNumber()
  subUnidad_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tipoEjecucion?: string;

  @IsOptional()
  @IsNumber()
  departamento_id?: number;

  @IsOptional()
  @IsNumber()
  objeto_id?: number;

  @IsOptional()
  @IsNumber()
  tiempoEstimado?: number;

  @IsOptional()
  @IsNumber()
  supervisor_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descripcionTarea?: string;

  @IsOptional()
  @IsDateString()
  fechaHora?: Date;

  @IsOptional()
  @IsNumber()
  tipoCambio?: number;

  @IsOptional()
  @IsString()
  estado?: string; // Estado de la OT, por ejemplo: 'pendiente', '

  @IsOptional()
  @IsNumber({}, { each: true })
  tecnicos?: number[]; // Lista de IDs de técnicos asignados
}
