import { IsString, IsInt, Min, IsDecimal } from 'class-validator';

export class CreateRepuestoDto {
  @IsString()
  nombre: string;

  @IsInt()
  @Min(0)
  cantidad: number;
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  costoUnitario: number;
  @IsString()
  descripcion: string;
}
