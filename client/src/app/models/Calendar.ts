export interface CalendarEvent {
  id: number;
  userId: number;
  title: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO date string
  endDateTime: string;   // ISO date string
  isAllDay: boolean;
  recurrence?: string;
  reminderMinutes?: number;
  status: string;
}
export enum CalendarView {
  Month = 'Month',
  Week = 'Week',
  Day = 'Day',
  Year = 'Year'
}