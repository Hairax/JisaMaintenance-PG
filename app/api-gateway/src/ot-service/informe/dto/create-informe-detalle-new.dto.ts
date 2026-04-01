import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateInformeDetalleDto {
  @IsInt()
  otId: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFinalización: string;
}
