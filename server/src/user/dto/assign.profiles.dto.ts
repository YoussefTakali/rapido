// src/user/dto/assign-profiles.dto.ts
import { IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignProfilesDto {
  @IsNumber()
  @Type(() => Number) // ensures the number gets transformed properly
  userId: number;

  @IsArray()
  @Type(() => Number)
  profileIds: number[];
}
