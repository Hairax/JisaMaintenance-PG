import { IsString } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  name: string;
  @IsString()
  ruc: string;
  @IsString()
  correoElectronico: string;
  @IsString()
  telefono: string;
  @IsString()
  direccion: string;
}
