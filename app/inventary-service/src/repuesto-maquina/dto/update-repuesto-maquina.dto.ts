import { IsOptional, IsString, IsNumber, IsInt, Min } from 'class-validator';

export class UpdateRepuestoMaquinaDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  nombre?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @Min(0, { message: 'La cantidad no puede ser negativa.' })
  cantidad?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo unitario debe ser un número con hasta 2 decimales.' },
  )
  @Min(0, { message: 'El costo unitario no puede ser negativo.' })
  costoUnitario?: number;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  descripcion?: string;

  @IsOptional()
  @IsInt({ message: 'El ID de la máquina debe ser un número entero.' })
  maquina_id?: number;

  @IsOptional()
  @IsInt({ message: 'El ID de la sub unidad debe ser un número entero.' })
  subUnidad?: number | null;
}
