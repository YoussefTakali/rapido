// src/calendar-event/calendar-event.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar.dto';
import { EventStatus } from 'generated/prisma';

@Injectable()
export class CalendarEventService {
  constructor(private prisma: PrismaService) {}

async create(data: CreateCalendarEventDto) {
  const startDate = new Date(data.startDateTime);
  const endDate = new Date(data.endDateTime);

  // Validate end date is after start date
  if (endDate <= startDate) {
    console.log('Invalid event: End time is before or equal to start time.');
    return {
      status: 400,
      message: 'Invalid: End time must be after start time.',
    };
  }

  // Convert to ISO strings
  const dataWithISO = {
    ...data,
    startDateTime: startDate.toISOString(),
    endDateTime: endDate.toISOString(),
  };

  // Check for overlapping events
  const overlappingEvent = await this.prisma.calendarEvent.findFirst({
    where: {
      OR: [
        {
          startDateTime: {
            lte: dataWithISO.endDateTime,
          },
          endDateTime: {
            gte: dataWithISO.startDateTime,
          },
        },
      ],
    },
  });

  if (overlappingEvent) {
    console.log('Conflict: Overlapping event detected:', overlappingEvent);
    return {
      status: 409,
      message: 'Conflict: An event overlaps with this time slot.',
    };
  }

  // No conflict, create the event
  const createdEvent = await this.prisma.calendarEvent.create({ data: dataWithISO });

  return {
    status: 201,
    message: 'Event created successfully.',
    data: createdEvent,
  };
}



  findAllByUser(userId: number, startDate?: string, endDate?: string) {
    return this.prisma.calendarEvent.findMany({
      where: {
        userId,
        startDateTime: startDate && endDate ? {
          gte: new Date(startDate),
          lte: new Date(endDate)
        } : undefined
      },
      orderBy: { startDateTime: 'asc' }
    });
  }

  findOne(id: number) {
    return this.prisma.calendarEvent.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateCalendarEventDto) {
    return this.prisma.calendarEvent.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.calendarEvent.delete({ where: { id } });
  }

  updateStatus(id: number, status: EventStatus) {
    return this.prisma.calendarEvent.update({
      where: { id },
      data: {  status }
    });
  }

  findUpcomingReminders(userId: number, minutesAhead: number) {
    const now = new Date();
    const future = new Date(now.getTime() + minutesAhead * 60000);

    return this.prisma.calendarEvent.findMany({
      where: {
        userId,
        reminderMinutes: { not: null },
        startDateTime: { gte: now, lte: future }
      }
    });
  }
}
