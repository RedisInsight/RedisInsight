import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { NotificationsDto, ReadNotificationsDto } from 'src/modules/notification/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
// import config from 'src/utils/config';

// const NOTIFICATIONS_CONFIG = config.get('notifications');

@Injectable()
export class NotificationService {
  private logger: Logger = new Logger('NotificationService');

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repository: Repository<NotificationEntity>,
  ) {}

  async getNotifications(): Promise<NotificationsDto> {
    this.logger.debug('Getting notifications list.');

    try {
      const notifications = await this.repository
        .createQueryBuilder('n')
        .orderBy('timestamp', 'DESC')
        // .limit(NOTIFICATIONS_CONFIG.queryLimit) // todo: do not forget when introduce "local" notifications
        .getMany();

      const totalUnread = await this.repository
        .createQueryBuilder()
        .where({ read: false })
        .getCount();

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
      const query: Record<string, any> = {};

      if (type) {
        query.type = type;
      }

      if (timestamp) {
        query.timestamp = timestamp;
      }

      await this.repository
        .createQueryBuilder('n')
        .update()
        .where(query)
        .set({ read: true })
        .execute();

      const totalUnread = await this.repository
        .createQueryBuilder()
        .where({ read: false })
        .getCount();

      return new NotificationsDto({
        notifications: [],
        totalUnread,
      });
    } catch (e) {
      this.logger.error('Unable to "read" notification(s)', e);
      throw new InternalServerErrorException('Unable to "read" notification(s)');
    }
  }
}
