import {
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsBoolean,
  IsNumber,
  Length,
  Min,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../enum/userRol.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 100)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  cargo?: UserRole;

  @IsOptional()
  @IsPhoneNumber('AR')
  phone?: string;

  @IsOptional()
  @IsPhoneNumber('AR')
  celphone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hora$?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minutos$?: number;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
