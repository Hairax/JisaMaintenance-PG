import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDepartamentoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
