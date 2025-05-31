import { IsOptional, IsString } from 'class-validator';

export class UpdateTipoMantenimientoDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}
