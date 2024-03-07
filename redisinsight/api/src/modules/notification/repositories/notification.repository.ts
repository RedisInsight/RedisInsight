import { NotificationType } from "../constants";
import { Notification } from "../models/notification";

export abstract class NotificationRepository {
    abstract getNotifications(): Promise<{ notifications: Notification[], totalUnread: number }>;
    abstract readNotifications(notificationType?: NotificationType, timestamp?: number): Promise<{ notifications: Notification[], totalUnread: number}>;
    abstract getGlobalNotifications(): Promise<Notification[]>;
    abstract deleteGlobalNotifications(): Promise<void>;
    abstract insertNotifications(notifications: Notification[]): Promise<void>;
    abstract getTotalUnread(): Promise<number>;
}
