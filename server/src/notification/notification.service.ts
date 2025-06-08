import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from 'generated/prisma';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(
    userId: number,
    message: string,
    type: NotificationType,
    addedId?: number, // Made optional since it might not always be needed
  ) {
    this.logger.log(`Creating notification for user ${userId}: ${message}`);

    if (!message) throw new Error('Notification message is required');
    if (!type) throw new Error('Notification type is required');

    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          message,
          type,
          addedId,
          isRead: false, // Explicitly set to false by default
        },
      });

      this.logger.log(`Notification created: ${notification.id}`);
      
      // Send notification via WebSocket if user is connected
      this.notificationGateway.sendNotification(userId, notification);
      
      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw new Error('Failed to create notification');
    }
  }

  async getNotificationsByUser(userId: number, options?: { unreadOnly?: boolean }) {
    try {
      return await this.prisma.notification.findMany({
        where: { 
          userId,
          ...(options?.unreadOnly ? { isRead: false } : {}),
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          message: true,
          type: true,
          addedId: true,
          createdAt: true,
          isRead: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get notifications for user ${userId}: ${error.message}`);
      throw new Error('Failed to fetch notifications');
    }
  }

  async getUnreadNotifications(userId: number) {
    return this.getNotificationsByUser(userId, { unreadOnly: true });
  }

  async markAsRead(notificationId: number) {
    try {
      return await this.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    } catch (error) {
      this.logger.error(`Failed to mark notification ${notificationId} as read: ${error.message}`);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: number) {
    try {
      await this.prisma.notification.updateMany({
        where: { 
          userId,
          isRead: false,
        },
        data: { isRead: true },
      });
      
      this.logger.log(`Marked all notifications as read for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read for user ${userId}: ${error.message}`);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: number) {
    try {
      return await this.prisma.notification.delete({
        where: { id: notificationId },
      });
    } catch (error) {
      this.logger.error(`Failed to delete notification ${notificationId}: ${error.message}`);
      throw new Error('Failed to delete notification');
    }
  }
}