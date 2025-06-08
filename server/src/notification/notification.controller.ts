import { Controller, Get, Req, UseGuards, UnauthorizedException, Patch, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy'; // Adjust path as needed

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserNotifications(@Req() req: Request) {
    const payload = req.user as JwtPayload;
    const userId = payload.sub; // Use 'sub' instead of 'id'
    
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.notificationService.getNotificationsByUser(userId);
  }
    @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(+id);
  }
}