import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUnidadMedidaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nombre: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  codigo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
