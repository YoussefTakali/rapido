// src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from 'generated/prisma';

export class UserResponseDto {
  @ApiProperty({ 
    description: 'User ID',
    example: 'clh7x8y9z0000abcdef123456'
  })
  @IsString()
  id: number;
 
  @ApiProperty({ 
    description: 'User full name',
    example: 'John Doe'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsString()
  email: string;

  @ApiProperty({ 
    description: 'User role',
    enum: Role,
    example: Role.EMPLOYEE
  })
  role: Role;
}

export class AuthResponseDto {
  @ApiProperty({ 
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  access_token: string;

  @ApiProperty({ 
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false
  })
  @IsOptional()
  @IsString()
  refresh_token?: string;

  @ApiProperty({ 
    description: 'User information',
    type: UserResponseDto
  })
  @ValidateNested()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}