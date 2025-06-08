import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [forwardRef(() => PrismaModule)], // Handle circular dependency
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway, // No forwardRef needed here
  ],
  exports: [NotificationService, NotificationGateway], // Export both
})
export class NotificationModule {}