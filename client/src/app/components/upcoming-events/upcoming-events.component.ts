import { Component, OnInit } from '@angular/core';
import { CalendarEventService, ApiCalendarEvent } from 'src/app/services/calendar-event.service';
import { AuthService } from 'src/app/services/auth.service';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

@Component({
  selector: 'app-upcoming-events',
  templateUrl: './upcoming-events.component.html',
  styleUrls: ['./upcoming-events.component.css']
})
export class UpcomingEventsComponent implements OnInit {
  events: Event[] = [];

  constructor(
    private calendarService: CalendarEventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUser()?.id;
    if (userId) {
      this.loadEvents(userId);
    }
  }

  loadEvents(userId: number): void {
    this.calendarService.findAllByUser(userId).subscribe({
      next: (apiEvents: ApiCalendarEvent[]) => {
        this.events = apiEvents.map(event => ({
          id: event.id,
          title: event.title,
          date: this.formatDate(event.startDateTime),
          time: this.formatTimeRange(event.startDateTime, event.endDateTime),
          location: event.location,
          type: event.status // or event.recurrence or other field you want
        }));
      },
      error: err => {
        console.error('Failed to load calendar events', err);
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTimeRange(startStr: string, endStr: string): string {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return `${start.toLocaleTimeString([], options)} - ${end.toLocaleTimeString([], options)}`;
  }
}
