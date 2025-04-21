import { IsString } from 'class-validator';

export class CreateCostCenterDto {
  @IsString()
  name: string;
}
