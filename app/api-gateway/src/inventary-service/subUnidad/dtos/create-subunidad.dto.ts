import { IsString, IsNumber } from 'class-validator';

export class CreateSubUnidadDto {
  @IsNumber()
  maquina_id: number;

  @IsString()
  descripcion: string;
}
