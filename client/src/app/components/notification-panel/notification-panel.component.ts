import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification, NotificationType } from 'src/app/models/Notification';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'app-notifications-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.css']
})
export class NotificationPanelComponent implements OnInit {
  notifications: {
    id: number;
    type: NotificationType;
    message: string;
    time: string;
    icon: string;
  }[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data: Notification[]) => {
        this.notifications = data.map((n) => ({
          id: n.id,
          type: n.type,
          message: n.message,
          time: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
          icon: this.getIcon(n.type)
        }));
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
      }
    });
  }

  private getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.UserRegister:
        return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>`;
      case NotificationType.MAILSENT:
        return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7H4l5-5v5z"></path></svg>`;
      case NotificationType.EVENTREMINDER:
        return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
      default:
        return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle></svg>`;
    }
  }
}
