import { IsString, IsNumber } from 'class-validator';

export class CreateProcessDto {
  @IsNumber()
  centroCosto_id: number;

  @IsString()
  name: string;
}
