import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateObjetoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
