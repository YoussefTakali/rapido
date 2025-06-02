// src/calendar-event/dto/create-calendar-event.dto.ts
import {
  IsString, IsOptional, IsBoolean, IsEnum,
  IsDateString, IsInt, Min
} from 'class-validator';
import { EventStatus, RecurrenceType } from 'generated/prisma';

export class CreateCalendarEventDto {
  @IsInt()
  userId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDateString()
  startDateTime: string;

  @IsDateString()
  endDateTime: string;

  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrence?: RecurrenceType;

  @IsOptional()
  @IsInt()
  @Min(0)
  reminderMinutes?: number;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
