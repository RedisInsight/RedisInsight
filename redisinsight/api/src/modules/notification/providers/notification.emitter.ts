import { Injectable, Logger } from '@nestjs/common';
import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { NotificationEvents, NotificationServerEvents } from 'src/modules/notification/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { NotificationDto, NotificationsDto } from 'src/modules/notification/dto';

@Injectable()
export class NotificationEmitter {
  private logger: Logger = new Logger('NotificationEmitter');

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repository: Repository<NotificationEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(NotificationEvents.NewNotifications)
  async notification(notifications: NotificationDto[]) {
    try {
      if (!notifications?.length) {
        return;
      }

      this.logger.debug(`${notifications.length} new notification(s) to emit`);

      const totalUnread = await this.repository
        .createQueryBuilder()
        .where({ read: false })
        .getCount();

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
