import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateProcessDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  centroCosto_id?: number;

  @IsOptional()
  @IsNumber()
  correlativo?: number;
}
