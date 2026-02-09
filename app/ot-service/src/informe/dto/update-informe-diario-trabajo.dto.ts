import { PartialType } from '@nestjs/mapped-types';
import { CreateInformeDiarioTrabajoDto } from './create-informe-diario-trabajo.dto';

export class UpdateInformeDiarioTrabajoDto extends PartialType(
  CreateInformeDiarioTrabajoDto,
) {}
