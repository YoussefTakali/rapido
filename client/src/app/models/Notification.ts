// src/app/models/notification.model.ts
export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
  addedId : number;
  type: NotificationType; // e.g., 'email', 'sms', 'push'
}
export enum NotificationType {
  UserRegister = 'UserRegister',
  MAILSENT = 'MAILSENT',
  EVENTREMINDER = 'EVENTREMINDER'
}