import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
