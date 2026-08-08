import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramacionOtDto } from './create-programacion-ot.dto';

export class UpdateProgramacionOtDto extends PartialType(
  CreateProgramacionOtDto,
) {}
