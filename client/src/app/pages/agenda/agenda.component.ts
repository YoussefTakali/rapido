import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { ApiCalendarEvent, CalendarEventService, MyCalendarEvent } from 'src/app/services/calendar-event.service';
export interface DisplayCalendarEvent extends MyCalendarEvent {
  start: Date;       // for calendar library usage
  time: string;      // formatted time string like '9 AM'
  duration: number;  // in hours or whatever unit you want
  color?: string;    // optional UI property (you can assign some default)
}



@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css'],
})
export class AgendaComponent implements OnInit {
  view: CalendarView = CalendarView.Week;
  CalendarView = CalendarView; // expose enum to template
  addEventForm!: FormGroup;
  showAddEventPopup = false;
  viewDate: Date = new Date(2024, 5, 24); // June 24, 2024
  weekDays: { name: string; date: number; fullName: string; isToday: boolean }[] = [];
  timeSlots: string[] = [
    '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  ];

  selectedEvent: MyCalendarEvent | null = null;
  events: ApiCalendarEvent[] = [];

  constructor(private calendarService: CalendarEventService,    private fb: FormBuilder,
) {
    this.generateWeekDays();
  }

  ngOnInit(): void {
    const userId = 22; // Replace with actual user ID logic
    this.calendarService.findAllByUser(userId).subscribe({
      next: (events) => {
        this.events = events;
      },
      error: (err) => {
        console.error('Error loading events:', err);
      },
    });
    console.log('AgendaComponent initialized with viewDate:', this.events);
     this.addEventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      location: [''],
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      isAllDay: [false],
      recurrence: ['NONE'],
      reminderMinutes: [15, [Validators.min(0)]],
      status: ['SCHEDULED'],
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
    const day = date.getDay(); // Sunday = 0
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  }
  openAddEventPopup(): void {
    this.showAddEventPopup = true;
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
    userId: 22, // hardcoded for now
    ...this.addEventForm.value,
  };

  this.calendarService.createEvent(eventPayload).subscribe({
    next: (res) => {
      alert('Event added successfully!');
      this.closeAddEventPopup();
      // Refresh events list
      this.calendarService.findAllByUser(22).subscribe(events => {
        this.events = events;
      });
    },
    error: (err) => {
      alert('Failed to add event. See console.');
      console.error(err);
    },
  });
}

  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
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

    const startDate = new Date(this.viewDate);
    startDate.setDate(this.weekDays[0].date);

    const endDate = new Date(this.viewDate);
    endDate.setDate(this.weekDays[6].date);

    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      return `${start.date} - ${end.date} ${startMonth} ${this.viewDate.getFullYear()}`;
    } else {
      return `${start.date} ${startMonth} - ${end.date} ${endMonth} ${this.viewDate.getFullYear()}`;
    }
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

  addEvent(): void {
    alert('Add event clicked');
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
    const pixelsPerMinute = 60 / 60;

    if (hour < startHour || hour > 17) return 0;

    return (hour - startHour) * 60 + minutes * pixelsPerMinute;
  }

  timeToPosition(time: string): number {
    const match = time.match(/(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    let hour = parseInt(match[1], 10);
    if (match[2].toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (match[2].toUpperCase() === 'AM' && hour === 12) hour = 0;

    const startHour = 7;
    const pixelsPerHour = 60;
    return (hour - startHour) * pixelsPerHour;
  }

  isBusinessHour(time: string): boolean {
    const match = time.match(/(\d+)\s*(AM|PM)/i);
    if (!match) return false;

    let hour = parseInt(match[1], 10);
    if (match[2].toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (match[2].toUpperCase() === 'AM' && hour === 12) hour = 0;

    return hour >= 8 && hour <= 17;
  }

getEventsForDay(dayIndex: number): DisplayCalendarEvent[] {
  const dayDate = new Date(this.getStartOfWeek(this.viewDate));
  dayDate.setDate(dayDate.getDate() + dayIndex);

  const dayEvents = this.events.filter(event => {
    const eventDate = new Date(event.startDateTime);
    return (
      eventDate.getFullYear() === dayDate.getFullYear() &&
      eventDate.getMonth() === dayDate.getMonth() &&
      eventDate.getDate() === dayDate.getDate()
    );
  });

  return dayEvents.map(event => {
    const start = new Date(event.startDateTime);
    
    let hour = start.getHours();
    let minutes = start.getMinutes();
    let ampm = hour >= 12 ? 'PM' : 'AM';
    let displayHour = hour % 12 || 12;
    const timeStr = `${displayHour}${minutes > 0 ? ':' + minutes.toString().padStart(2, '0') : ''} ${ampm}`;

    let durationHours = 1;
    if (event.endDateTime) {
      durationHours = (new Date(event.endDateTime).getTime() - start.getTime()) / (1000 * 60 * 60);
      if (durationHours <= 0) durationHours = 1;
    }

    // Assign default color or compute based on status, type, etc.
    const color = 'blue';  // example static color

    return {
      ...event,
      start,
      time: timeStr,
      duration: durationHours,
      color,
    } as DisplayCalendarEvent;
  });
}


  selectEvent(event: MyCalendarEvent): void {
    this.selectedEvent = event;
  }
}
