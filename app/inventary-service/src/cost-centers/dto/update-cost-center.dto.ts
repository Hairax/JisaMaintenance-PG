import { IsString } from 'class-validator';
export class UpdateCostCenterDto {
  @IsString()
  name: string;
}
