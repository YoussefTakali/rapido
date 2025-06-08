import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { ClientModule } from './client/client.module';
import { DevisModule } from './devis/devis.module';
import { CalendarEventModule } from './calendar-event/calendar-event.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [ PrismaModule, AuthModule, ConfigModule.forRoot({
      isGlobal: true, 
    }), UserModule, ProfileModule, ClientModule, DevisModule, CalendarEventModule,NotificationModule],
  controllers: [AppController],
  providers: [AppService],
}) 
export class AppModule {}
