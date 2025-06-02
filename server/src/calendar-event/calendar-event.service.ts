// src/calendar-event/calendar-event.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar.dto';
import { EventStatus } from 'generated/prisma';

@Injectable()
export class CalendarEventService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCalendarEventDto) {
    return this.prisma.calendarEvent.create({ data });
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
