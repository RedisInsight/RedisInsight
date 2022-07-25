import { ApiProperty } from '@nestjs/swagger';
import { NotificationDto } from './notification.dto';

export class NotificationsDto {
  @ApiProperty({
    type: () => NotificationDto,
    isArray: true,
    description: 'Ordered notifications list',
  })
  notifications: NotificationDto[];

  @ApiProperty({
    type: Number,
    example: 2,
    description: 'Number of unread notifications',
  })
  totalUnread: number;

  constructor(entity: Partial<NotificationsDto>) {
    Object.assign(this, entity);
  }
}
