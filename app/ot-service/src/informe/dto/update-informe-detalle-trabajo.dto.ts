import { PartialType } from '@nestjs/mapped-types';
import { CreateInformeDetalleTrabajoDto } from './create-informe-detalle-trabajo.dto';

export class UpdateInformeDetalleTrabajoDto extends PartialType(
  CreateInformeDetalleTrabajoDto,
) {}
