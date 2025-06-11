import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CalendarView } from 'angular-calendar';
import { ApiCalendarEvent, CalendarEventService, MyCalendarEvent } from 'src/app/services/calendar-event.service';

export interface DisplayCalendarEvent extends MyCalendarEvent {
  start: Date;
  time: string;
  duration: number;
  color?: string;
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AgendaComponent implements OnInit {
  view: CalendarView = CalendarView.Week;
  CalendarView = CalendarView;
  addEventForm!: FormGroup;
  showAddEventPopup = false;

  viewDate: Date = new Date(2024, 5, 24); // June 24, 2024
  weekDays: { name: string; date: number; fullName: string; isToday: boolean }[] = [];
  timeSlots: string[] = [
    '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'
  ];

  selectedEvent: MyCalendarEvent | null = null;
  events: ApiCalendarEvent[] = [];

  constructor(
    private calendarService: CalendarEventService,
    private fb: FormBuilder
  ) {
    this.generateWeekDays();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadEvents();
  }

  initForm(): void {
    this.addEventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      location: [''],
startDateTime: ['', [Validators.required, this.timeWithinBusinessHours]],
endDateTime: ['', [Validators.required, this.timeWithinBusinessHours]],
      isAllDay: [false],
      recurrence: ['NONE'],
      reminderMinutes: [15, [Validators.min(0)]],
      status: ['SCHEDULED'],
    });
  }

  loadEvents(): void {
    this.calendarService.findAllByUser(this.getUserId()!).subscribe({
      next: (events) => {
        this.events = events;
        console.log('Events loaded:', this.events);
      },
      error: (err) => console.error('Error loading events:', err),
    });
  }

  generateWeekDays(): void {
    this.weekDays = [];
    const startOfWeek = this.getStartOfWeek(this.viewDate);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      this.weekDays.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        fullName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        date: date.getDate(),
        isToday: this.isSameDate(date, today),
      });
    }
  }

  getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  }

  openAddEventPopup(dateTime?: Date): void {
    this.showAddEventPopup = true;
    if (dateTime) {
      this.addEventForm.patchValue({
        startDateTime: dateTime.toISOString().slice(0, 16),
        endDateTime: new Date(dateTime.getTime() + 3600000).toISOString().slice(0, 16),
      });
    }
  }

  closeAddEventPopup(): void {
    this.showAddEventPopup = false;
    this.addEventForm.reset({
      title: '',
      description: '',
      location: '',
      startDateTime: '',
      endDateTime: '',
      isAllDay: false,
      recurrence: 'NONE',
      reminderMinutes: 15,
      status: 'SCHEDULED',
    });
  }

  submitAddEvent(): void {
    if (this.addEventForm.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

    const eventPayload: MyCalendarEvent = {
      userId: this.getUserId(),
      ...this.addEventForm.value,
    };

    this.calendarService.createEvent(eventPayload).subscribe({
      next: (res: any) => {
        if (res.status && res.status !== 201) {
          alert(`Failed to add event: ${res.message || 'Unknown error'}`);
          return;
        }

        alert('Event added successfully!');
        this.closeAddEventPopup();
        this.loadEvents();
      },
      error: (err) => {
        alert('Failed to add event. See console.');
        console.error(err);
      },
    });
  }
getEventDuration(event: MyCalendarEvent): number {
  const start = new Date(event.startDateTime).getTime();
  const end = new Date(event.endDateTime).getTime();
  const durationInMinutes = (end - start) / (1000 * 60);
  return durationInMinutes;
}

  getEventsForDay(dayIndex: number): DisplayCalendarEvent[] {
    const dayDate = new Date(this.getStartOfWeek(this.viewDate));
    dayDate.setDate(dayDate.getDate() + dayIndex);

    const dayEvents = this.events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return this.isSameDate(eventDate, dayDate);
    });

    return dayEvents.map(event => {
      const start = new Date(event.startDateTime);
      const end = event.endDateTime ? new Date(event.endDateTime) : null;

      const hour = start.getHours();
      const minutes = start.getMinutes();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const timeStr = `${displayHour}${minutes ? ':' + minutes.toString().padStart(2, '0') : ''} ${ampm}`;

      let durationHours = 1;
      if (end) {
        durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (durationHours <= 0) durationHours = 1;
      }

      return {
        ...event,
        start,
        time: timeStr,
        duration: durationHours,
        color: 'blue',
      } as DisplayCalendarEvent;
    });
  }

  setView(view: CalendarView): void {
    this.view = view;
  }

  setToday(): void {
    this.viewDate = new Date();
    this.generateWeekDays();
  }

  previousWeek(): void {
    this.viewDate.setDate(this.viewDate.getDate() - 7);
    this.generateWeekDays();
  }

  nextWeek(): void {
    this.viewDate.setDate(this.viewDate.getDate() + 7);
    this.generateWeekDays();
  }

  getCurrentMonthYear(): string {
    return this.viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getWeekDateRange(): string {
    if (this.weekDays.length === 0) return '';
    const start = this.weekDays[0];
    const end = this.weekDays[6];
    const startMonth = new Date(this.viewDate).toLocaleDateString('en-US', { month: 'short' });
    const endMonth = new Date(this.viewDate).toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      return `${start.date} - ${end.date} ${startMonth} ${this.viewDate.getFullYear()}`;
    } else {
      return `${start.date} ${startMonth} - ${end.date} ${endMonth} ${this.viewDate.getFullYear()}`;
    }
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  getUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id ?? null;
  }

  isCurrentHour(time: string): boolean {
    const now = new Date();
    const hour = now.getHours();

    const match = time.match(/(\d+)\s*(AM|PM)/i);
    if (!match) return false;

    let timeHour = parseInt(match[1], 10);
    if (match[2].toUpperCase() === 'PM' && timeHour !== 12) timeHour += 12;
    if (match[2].toUpperCase() === 'AM' && timeHour === 12) timeHour = 0;

    return timeHour === hour;
  }

  getCurrentTimePosition(): number {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const startHour = 7;
    const pixelsPerMinute = 1;

    if (hour < startHour || hour > 17) return 0;

    return (hour - startHour) * 60 + minutes * pixelsPerMinute;
  }

timeToPosition(dateTime: string): number {
  const eventDate = new Date(dateTime);
  const calendarStartHour = 7; // your calendar starts at 7:00 AM

  const hours = eventDate.getHours();
  const minutes = eventDate.getMinutes();

  const totalMinutesFromStart = (hours - calendarStartHour) * 60 + minutes;

  const pixelsPerMinute = 70 / 60; // ≈ 1.1667
  return totalMinutesFromStart * pixelsPerMinute;
}


  isBusinessHour(time: string): boolean {
    const match = time.match(/(\d+)\s*(AM|PM)/i);
    if (!match) return false;

    let hour = parseInt(match[1], 10);
    if (match[2].toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (match[2].toUpperCase() === 'AM' && hour === 12) hour = 0;

    return hour >= 8 && hour <= 17;
  }

  getCurrentTimeZone(): string {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.split('/').pop() || tz;
  }

  getCurrentGMTOffset(): string {
    const offsetMinutes = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes > 0 ? '-' : '+';
    return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  selectEvent(event: MyCalendarEvent): void {
    this.selectedEvent = event;
  }
    addEvent(dateTime?: Date) {
  this.showAddEventPopup = true;
  if (dateTime) {
    this.addEventForm.patchValue({
      startDateTime: dateTime.toISOString().slice(0,16),
      endDateTime: new Date(dateTime.getTime() + 60 * 60 * 1000).toISOString().slice(0,16),
    });
  }
}
openEventDetails(event: MyCalendarEvent) {
  this.selectedEvent = event;
}

closeEventDetails() {
  this.selectedEvent = null;
}

timeWithinBusinessHours(control: AbstractControl): ValidationErrors | null {
  const dateValue = new Date(control.value);
  if (isNaN(dateValue.getTime())) return null; // ignore if not a valid date

  const hours = dateValue.getHours();
  if (hours < 7 || hours > 17) {
    return { outsideBusinessHours: true };
  }
  return null;
}

}
