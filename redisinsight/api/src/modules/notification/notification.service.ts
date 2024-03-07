import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { NotificationsDto, ReadNotificationsDto } from 'src/modules/notification/dto';
import { plainToClass } from 'class-transformer';
import { NotificationRepository } from './repositories/notification.repository';
// import config from 'src/utils/config';

// const NOTIFICATIONS_CONFIG = config.get('notifications');

@Injectable()
export class NotificationService {
  private logger: Logger = new Logger('NotificationService');

  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async getNotifications(): Promise<NotificationsDto> {
    this.logger.debug('Getting notifications list.');

    try {
     const { notifications, totalUnread } = await this.notificationRepository.getNotifications();

      return plainToClass(NotificationsDto, {
        notifications,
        totalUnread,
      });
    } catch (e) {
      this.logger.error('Unable to get notifications list', e);
      throw new InternalServerErrorException('Unable to get notifications list');
    }
  }

  /**
   * Change read=true to notification(s) based on filter type and timestamp.
   * When "type" and "timestamp" defined a single notification will be modified
   * since we guarantee uniqueness by these fields
   * If no filters - all notifications
   * @param dto
   */
  async readNotifications(dto: ReadNotificationsDto): Promise<NotificationsDto> {
    try {
      this.logger.debug('Updating "read=true" status for notification(s).');
      const { type, timestamp } = dto;

      const { notifications, totalUnread } = await this.notificationRepository.readNotifications(type, timestamp);

      return new NotificationsDto(plainToClass(NotificationsDto, {
        notifications,
        totalUnread,
      }));
    } catch (e) {
      this.logger.error('Unable to "read" notification(s)', e);
      throw new InternalServerErrorException('Unable to "read" notification(s)');
    }
  }
}
