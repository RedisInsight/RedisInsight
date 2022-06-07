import {
  Body,
  Controller, Param, Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import { PubSubService } from 'src/modules/pub-sub/pub-sub.service';
import { AppTool } from 'src/models';
import { PublishDto } from 'src/modules/pub-sub/dto/publish.dto';
import { PublishResponse } from 'src/modules/pub-sub/dto/publish.response';

@ApiTags('Pub/Sub')
@Controller('pub-sub')
export class PubSubController {
  constructor(private service: PubSubService) {}

  @Post('messages')
  @ApiRedisInstanceOperation({
    description: 'Publish message to a channel',
    statusCode: 201,
    responses: [
      {
        status: 201,
        description: 'Returns number of clients message ws delivered',
        type: PublishResponse,
      },
    ],
  })
  async publish(
    @Param('dbInstance') instanceId: string,
      @Body() dto: PublishDto,
  ): Promise<PublishResponse> {
    return this.service.publish({
      instanceId,
      tool: AppTool.Common,
    }, dto);
  }
}
