import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { SessionMetadata } from 'src/common/models';
import { Repository } from 'typeorm';
import { NotificationType } from '../constants';
import { NotificationEntity } from '../entities/notification.entity';
import { Notification } from '../models/notification';
import { NotificationRepository } from './notification.repository';

export class LocalNotificationRepository extends NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repository: Repository<NotificationEntity>,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getNotifications(_: SessionMetadata): Promise<{ notifications: Notification[]; totalUnread: number }> {
    const notifications = await this.repository
      .createQueryBuilder('n')
      .orderBy('timestamp', 'DESC')
      // .limit(NOTIFICATIONS_CONFIG.queryLimit) // todo: do not forget when introduce "local" notifications
      .getMany();

    const totalUnread = await this.repository
      .createQueryBuilder()
      .where({ read: false })
      .getCount();

    return {
      notifications: notifications.map((ne) => plainToClass(Notification, ne)),
      totalUnread,
    };
  }

  async readNotifications(
    _: SessionMetadata,
    notificationType?: NotificationType,
    timestamp?: number,
  ): Promise<{ notifications: Notification[]; totalUnread: number }> {
    const query: Record<string, any> = {};

    if (notificationType) {
      query.type = notificationType;
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

    return {
      notifications: [],
      totalUnread,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getGlobalNotifications(_: SessionMetadata): Promise<Notification[]> {
    const entities = await this.repository
      .createQueryBuilder('n')
      .where({ type: NotificationType.Global })
      .select(['n.timestamp', 'n.read'])
      .getMany();

    return entities.map((ne) => plainToClass(Notification, ne));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteGlobalNotifications(_: SessionMetadata): Promise<void> {
    await this.repository
      .createQueryBuilder('n')
      .delete()
      .where({ type: NotificationType.Global })
      .execute();
  }

  async insertNotifications(
    _: SessionMetadata,
    notifications: Notification[],
  ): Promise<void> {
    await this.repository.insert(
      notifications.map((n) => plainToClass(NotificationEntity, n)),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTotalUnread(_: SessionMetadata): Promise<number> {
    return await this.repository
      .createQueryBuilder()
      .where({ read: false })
      .getCount();
  }
}
