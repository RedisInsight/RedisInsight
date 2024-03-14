import {
  Body,
  Controller, Get, HttpCode, Patch, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from 'src/modules/notification/notification.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsDto, ReadNotificationsDto } from 'src/modules/notification/dto';
import { ClientMetadata, SessionMetadata } from 'src/common/models';
import { BrowserClientMetadata } from '../browser/decorators/browser-client-metadata.decorator';
import { RequestSessionMetadata } from 'src/common/decorators';
import { Session } from 'inspector';

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
  getNotifications(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<NotificationsDto> {
    return this.service.getNotifications(sessionMetadata);
  }

  @HttpCode(200)
  @ApiOperation({ description: 'Mark all notifications as read' })
  @ApiOkResponse({
    type: NotificationsDto,
  })
  @Patch('/read')
  readNotifications(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Body() dto: ReadNotificationsDto
  ): Promise<NotificationsDto> {
    return this.service.readNotifications(sessionMetadata, dto);
  }
}
