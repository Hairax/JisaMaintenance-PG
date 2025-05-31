import { IsString, IsNotEmpty } from 'class-validator';

export class CreateObjetoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
