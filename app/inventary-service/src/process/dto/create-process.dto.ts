import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProcessDto {
  @IsNumber()
  centroCosto_id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  correlativo?: number;
}
