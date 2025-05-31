import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTipoMantenimientoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
