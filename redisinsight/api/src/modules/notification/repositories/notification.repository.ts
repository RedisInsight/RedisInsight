import { SessionMetadata } from 'src/common/models';
import { NotificationType } from '../constants';
import { Notification } from '../models/notification';

export abstract class NotificationRepository {
  abstract getNotifications(
    sessionMetadata: SessionMetadata,
  ): Promise<{ notifications: Notification[]; totalUnread: number }>;

  abstract readNotifications(
    sessionMetadata: SessionMetadata,
    notificationType?: NotificationType,
    timestamp?: number,
  ): Promise<{ notifications: Notification[]; totalUnread: number }>;

  abstract getGlobalNotifications(
    sessionMetadata: SessionMetadata,
  ): Promise<Notification[]>;

  abstract deleteGlobalNotifications(
    sessionMetadata: SessionMetadata,
  ): Promise<void>;

  abstract insertNotifications(
    sessionMetadata: SessionMetadata,
    notifications: Notification[],
  ): Promise<void>;

  abstract getTotalUnread(sessionMetadata: SessionMetadata): Promise<number>;
}
