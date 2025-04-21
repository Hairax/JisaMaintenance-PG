import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateRepuestoMaquinaDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  nombre: string;

  @IsNotEmpty({ message: 'La cantidad no puede estar vacía.' })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' }) // Opciones de IsNumber pueden ir aquí si es necesario
  @Min(0, { message: 'La cantidad no puede ser negativa.' }) // Asumiendo que no puede ser negativa
  cantidad: number;

  @IsNotEmpty({ message: 'El costo unitario no puede estar vacío.' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo unitario debe ser un número con hasta 2 decimales.' },
  )
  @Min(0, { message: 'El costo unitario no puede ser negativo.' })
  costoUnitario: number;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  descripcion?: string;

  @IsNotEmpty({ message: 'El ID de la máquina no puede estar vacío.' })
  @IsInt({ message: 'El ID de la máquina debe ser un número entero.' })
  maquina_id: number;

  @IsOptional()
  @IsInt({ message: 'El ID de la sub unidad debe ser un número entero.' })
  subUnidad?: number;
}
