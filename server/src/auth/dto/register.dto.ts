import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  dateOfBirth: Date;
  @IsOptional()
  @IsString()
  profilePicture?: string;
}
