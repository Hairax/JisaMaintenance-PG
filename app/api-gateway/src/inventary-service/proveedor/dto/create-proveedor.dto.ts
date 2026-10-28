import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateProveedorDto {
  // Código del proveedor = su ID. Opcional: si no se envía, se asigna el
  // siguiente automáticamente.
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  ruc?: string;
  @IsOptional()
  @IsString()
  correoElectronico?: string;
  @IsOptional()
  @IsString()
  telefono?: string;
  @IsOptional()
  @IsString()
  direccion?: string;
}
