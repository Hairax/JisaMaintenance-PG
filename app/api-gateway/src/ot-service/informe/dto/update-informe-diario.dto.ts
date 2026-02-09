import { PartialType } from '@nestjs/mapped-types';
import { CreateInformeDiarioDto } from './create-informe-diario.dto';

export class UpdateInformeDiarioDto extends PartialType(
  CreateInformeDiarioDto,
) {}
