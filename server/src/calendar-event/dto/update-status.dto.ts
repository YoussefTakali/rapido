import { IsEnum } from 'class-validator';
import { EventStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(EventStatus)
  status: EventStatus;
}