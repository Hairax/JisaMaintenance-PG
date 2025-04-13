import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  password: string;
}
