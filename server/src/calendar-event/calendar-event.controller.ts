import { Body, Controller, Post, Put, Patch, Param, Get, Delete, Query } from '@nestjs/common';
import { CalendarEventService } from './calendar-event.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { EventStatus } from '@prisma/client';
import { UpdateCalendarEventDto } from './dto/update-calendar.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('calendar-events')
export class CalendarEventController {
  constructor(private readonly service: CalendarEventService) {}

  @Post()
  create(@Body() body: CreateCalendarEventDto) {
    return this.service.create(body);
  }

  @Get('/user/:userId')
  findAllByUser(
    @Param('userId') userId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.service.findAllByUser(+userId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() body: UpdateCalendarEventDto) {
    return this.service.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }

@Patch(':id/status')
updateStatus(@Param('id') id: number, @Body() body: UpdateStatusDto) {
  return this.service.updateStatus(+id, body.status);
}
  @Get('/user/:userId/upcoming')
  getUpcoming(@Param('userId') userId: number, @Query('minutes') minutes = 15) {
    return this.service.findUpcomingReminders(+userId, +minutes);
  }
}
