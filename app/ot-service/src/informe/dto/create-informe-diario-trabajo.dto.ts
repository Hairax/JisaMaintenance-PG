import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateInformeDiarioTrabajoDto {
  @IsInt()
  tecnico_id: number;

  @IsDateString()
  fechaTrabajo: Date;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
