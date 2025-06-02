import { Module } from '@nestjs/common';
import { CalendarEventService } from './calendar-event.service';
import { CalendarEventController } from './calendar-event.controller';

@Module({
  providers: [CalendarEventService],
  controllers: [CalendarEventController]
})
export class CalendarEventModule {}
