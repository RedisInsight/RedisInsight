import { Module } from '@nestjs/common';
import { NotificationGateway } from 'src/modules/notification/notification.gateway';
import { NotificationService } from 'src/modules/notification/notification.service';
import { GlobalNotificationProvider } from 'src/modules/notification/providers/global-notification.provider';
import { NotificationEmitter } from 'src/modules/notification/providers/notification.emitter';
import { NotificationController } from 'src/modules/notification/notification.controller';

@Module({
  providers: [
    NotificationGateway,
    NotificationService,
    GlobalNotificationProvider,
    NotificationEmitter,
  ],
  controllers: [
    NotificationController,
  ],
})
export class NotificationModule {}
