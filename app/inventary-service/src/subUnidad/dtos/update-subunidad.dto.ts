import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateSubUnidadDto {
  @IsOptional()
  @IsNumber()
  maquina_id?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  correlativo?: number;
}
