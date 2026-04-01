import { IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInformeDetalleDto } from './create-informe-detalle-new.dto';

export class CreateInformeDto {
  @IsInt()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInformeDetalleDto)
  detalles: CreateInformeDetalleDto[];
}
