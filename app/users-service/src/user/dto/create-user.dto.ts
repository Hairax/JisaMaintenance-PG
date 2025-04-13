import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsPhoneNumber,
  IsNumber,
  Min,
  Length,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../enum/userRol.enum';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 100)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  cargo: UserRole;

  @IsPhoneNumber('AR')
  phone: string;

  @IsPhoneNumber('AR')
  celphone: string;

  @IsNumber()
  @Min(0)
  hora$: number;

  @IsNumber()
  @Min(0)
  minutos$: number;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsBoolean()
  status: boolean;
}
