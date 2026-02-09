import { IsInt, IsString, IsNumber } from 'class-validator';

export class CreateInformeDetalleTrabajoDto {
  @IsInt()
  informeDiario_id: number;

  @IsInt()
  ordenTrabajo_id: number;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFin: string;

  @IsString()
  descripcionLabor: string;

  @IsNumber()
  horasCalculadas: number;

  @IsNumber()
  costoCalculado: number;
}
