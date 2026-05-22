import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateMaquinaDto {
  @IsString()
  name: string;

  @IsString()
  fabricante: string;

  @IsString()
  tipoDeMaquina: string;

  @IsString()
  numeroDeSerie: string;

  @IsDateString()
  fechaDeFabricacion: Date;

  @IsDateString()
  fechaDeMontaje: Date;

  @IsNumber()
  costo: number;

  @IsNumber()
  horasTrabajadas: number;

  @IsNumber()
  centroCosto_id: number;

  @IsNumber()
  proceso_id: number;

  @IsNumber()
  proveedor_id: number;

  @IsOptional()
  @IsNumber()
  correlativo?: number;
}
