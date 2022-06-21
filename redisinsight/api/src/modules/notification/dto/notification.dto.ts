import { NotificationType } from 'src/modules/notification/constants';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.Global,
    description: 'Type of notification',
  })
  type: NotificationType;

  @ApiProperty({
    type: Number,
    example: 1655738357,
    description: 'Timestamp of notification',
  })
  timestamp: number;

  @ApiProperty({
    type: String,
    example: 'Some announcement',
    description: 'Notification title',
  })
  title: string;

  @ApiProperty({
    type: String,
    example: 'Some valid <a href="">link</a>',
    description: 'Notification body (with html tags)',
  })
  body: string;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Determines if notification was shown to user in the Notification Center',
  })
  read: boolean;
}
