import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "generated/prisma";

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  phoneNumber: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
