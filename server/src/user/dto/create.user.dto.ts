import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";

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
