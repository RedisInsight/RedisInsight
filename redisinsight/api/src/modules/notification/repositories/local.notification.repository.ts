import { InjectRepository } from "@nestjs/typeorm";
import { NotificationRepository } from "./notification.repository";
import { Repository } from "typeorm";
import { NotificationEntity } from "../entities/notification.entity";
import { plainToClass } from "class-transformer";
import { NotificationType } from "../constants";
import { Notification } from "../models/notification";

export class LocalNotificationRepository extends NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repository: Repository<NotificationEntity>,
  ) {
    super();
  }

  async getNotifications(): Promise<{ notifications: Notification[]; totalUnread: number; } {
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
      notifications: notifications.map(ne => plainToClass(Notification, ne)),
      totalUnread,
    };
  }

  async readNotifications(notificationType?: NotificationType, timestamp?: number): Promise<{ notifications: Notification[]; totalUnread: number; }>{
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
      totalUnread
    }
  }

  async getGlobalNotifications(): Promise<Notification[]> {
    const entities = await this.repository
      .createQueryBuilder('n')
      .where({ type: NotificationType.Global })
      .select(['n.timestamp', 'n.read'])
      .getMany();

    return entities.map(ne => plainToClass(Notification, ne));
  }

  async deleteGlobalNotifications(): Promise<void> {
     await this.repository
        .createQueryBuilder('n')
        .delete()
        .where({ type: NotificationType.Global })
        .execute();
  }

  async insertNotifications(notifications: Notification[]): Promise<void> {
    await this.repository.insert(notifications.map(n => plainToClass(NotificationEntity, n)));
  }

  async getTotalUnread(): Promise<number> {
    const totalUnread = await this.repository
      .createQueryBuilder()
      .where({ read: false })
      .getCount();

    return totalUnread;
  }
}
