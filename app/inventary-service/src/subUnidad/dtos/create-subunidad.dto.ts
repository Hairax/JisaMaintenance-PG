import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateSubUnidadDto {
  @IsNumber()
  maquina_id: number;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  correlativo?: number;
}
