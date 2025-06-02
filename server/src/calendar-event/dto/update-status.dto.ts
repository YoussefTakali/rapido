import { IsEnum } from 'class-validator';
import { EventStatus } from 'generated/prisma';

export class UpdateStatusDto {
  @IsEnum(EventStatus)
  status: EventStatus;
}