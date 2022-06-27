import {
  Controller, Get, HttpCode, Patch,
} from '@nestjs/common';
import { NotificationService } from 'src/modules/notification/notification.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsDto } from 'src/modules/notification/dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly service: NotificationService,
  ) {}

  @HttpCode(200)
  @ApiOperation({ description: 'Return ordered notifications history' })
  @ApiOkResponse({
    type: NotificationsDto,
  })
  @Get()
  getNotifications(): Promise<NotificationsDto> {
    return this.service.getNotifications();
  }

  @HttpCode(200)
  @ApiOperation({ description: 'Mark all notifications as read' })
  @Patch('/read')
  readAllNotifications(): Promise<void> {
    return this.service.readAllNotifications();
  }
}
