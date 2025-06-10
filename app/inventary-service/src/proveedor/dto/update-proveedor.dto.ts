import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateProveedorDto {
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsString()
  @IsNotEmpty()
  ruc?: string;

  @IsString()
  @IsNotEmpty()
  correoElectronico?: string;

  @IsString()
  @IsNotEmpty()
  telefono?: string;

  @IsString()
  @IsNotEmpty()
  direccion?: string;
}
