// src/calendar-event/dto/update-calendar-event.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCalendarEventDto } from './create-calendar-event.dto';

export class UpdateCalendarEventDto extends PartialType(CreateCalendarEventDto) {}
