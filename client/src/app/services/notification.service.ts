// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Notification } from '../models/Notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiBaseUrl}/notifications`;

  private _hasUnreadNotifications = new BehaviorSubject<boolean>(false);
  hasUnreadNotifications$ = this._hasUnreadNotifications.asObservable();

  private _latestNotification = new BehaviorSubject<Notification | null>(null);
  latestNotification$ = this._latestNotification.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${notificationId}/read`, {});
  }

  triggerNewNotification(notification: Notification) {
    this._hasUnreadNotifications.next(true);
    this._latestNotification.next(notification);

    setTimeout(() => this._hasUnreadNotifications.next(false), 5000);
  }

  clearUnreadState() {
    this._hasUnreadNotifications.next(false);
  }
    markAllAsRead(): void {
    // Option 1: call backend API endpoint to mark all read
    this.http.patch(`${this.apiUrl}/mark-all-read`, {}).subscribe({
      next: () => {
        this.clearUnreadState();
      },
      error: (err) => {
        console.error('Failed to mark all notifications as read:', err);
      },
    });
  }
}
