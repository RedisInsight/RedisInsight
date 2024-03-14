import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SessionMetadata } from 'src/common/models';
import { NotificationEvents, NotificationServerEvents } from 'src/modules/notification/constants';
import { NotificationDto, NotificationsDto } from 'src/modules/notification/dto';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationEmitter {
  private logger: Logger = new Logger('NotificationEmitter');

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(NotificationEvents.NewNotifications)
  async notification(sessionMetadata: SessionMetadata, notifications: NotificationDto[]) {
    try {
      if (!notifications?.length) {
        return;
      }

      this.logger.debug(`${notifications.length} new notification(s) to emit`);

      const totalUnread = await this.notificationRepository.getTotalUnread(sessionMetadata);

      this.eventEmitter.emit(NotificationServerEvents.Notification, new NotificationsDto({
        notifications,
        totalUnread,
      }));
    } catch (e) {
      this.logger.error('Unable to prepare dto for notifications', e);
      // ignore error
    }
  }
}
