import { Notification } from './models/notification';

export interface INotificationsProvider {
  getReadStatuses(userId: string): Promise<Partial<Notification>[]> // fields: timestamp, read
  upsert(userId: string, notifications: Notification[]): Promise<Notification[]>
  deleteMany(userId: string, timestamps: string[]): Promise<void>
  setAllRead(userId: string): Promise<void>
  getCurrentNotifications(userId: string): Promise<Notification[]> // ORDER BY timestamp DESC
}
