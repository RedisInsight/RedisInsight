import {
  Body,
  Controller, Get, HttpCode, Patch, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from 'src/modules/notification/notification.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsDto, ReadNotificationsDto } from 'src/modules/notification/dto';

@ApiTags('Notifications')
@Controller('notifications')
@UsePipes(new ValidationPipe({ transform: true }))
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
  @ApiOkResponse({
    type: NotificationsDto,
  })
  @Patch('/read')
  readNotifications(@Body() dto: ReadNotificationsDto): Promise<NotificationsDto> {
    return this.service.readNotifications(dto);
  }
}
