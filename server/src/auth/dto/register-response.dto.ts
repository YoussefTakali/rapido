import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserResponseDto } from './auth-response.dto';

export class RegisterResponseDto {
  @ApiProperty({ 
    description: 'Success message',
    example: 'User registered successfully'
  })
  @IsString()
  message: string;

  @ApiProperty({ 
    description: 'Registered user information',
    type: UserResponseDto
  })
  @ValidateNested()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}