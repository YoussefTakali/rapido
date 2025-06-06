import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent } from '../models/Calendar';
import { S } from '@fullcalendar/core/internal-common';
import { environment } from 'src/environments/environment';
export interface ApiCalendarEvent {
  id: number;
  userId: number;
  title: string;
  description: string;
  location: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
  isAllDay: boolean;
  recurrence: string;
  reminderMinutes: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  day:number; // 'Monday', 'Tuesday', etc.
}
export interface MyCalendarEvent {
  userId: number;
  title: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  recurrence: string;
  reminderMinutes: number;
  status: string;
}
@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {
  private apiUrl = `${environment.apiBaseUrl}/calendar-events`;

  constructor(private http: HttpClient) {}

  findAllByUser(userId: number): Observable<ApiCalendarEvent[]> {
    console.log(`Fetching calendar events for user ID: ${userId}`);
    return this.http.get<ApiCalendarEvent[]>(`${this.apiUrl}/user/${userId}`);
  }
    createEvent(event: MyCalendarEvent): Observable<MyCalendarEvent> {
      console.log('Creating calendar event:', event);
    return this.http.post<MyCalendarEvent>(this.apiUrl, event);
  }
    findEventById(eventId: number): Observable<ApiCalendarEvent> {
    console.log(`Fetching calendar event for ID: ${eventId}`);
    return this.http.get<ApiCalendarEvent>(`${this.apiUrl}/${eventId}`);
  }
}
