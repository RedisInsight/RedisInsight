import { NotificationType } from 'src/modules/notification/constants';

export class Notification {
  type: NotificationType;

  timestamp: number;

  title: string;

  category?: string;

  categoryColor?: string;

  body: string;

  read?: boolean = false;
}
