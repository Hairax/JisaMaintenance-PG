import { PartialType } from '@nestjs/mapped-types';
import { CreateInformeDetalleDto } from './create-informe-detalle.dto';

export class UpdateInformeDetalleDto extends PartialType(
  CreateInformeDetalleDto,
) {}
