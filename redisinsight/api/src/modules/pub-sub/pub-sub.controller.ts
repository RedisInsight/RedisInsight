import {
  Body,
  Controller, Param, Post, UsePipes, ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import { PubSubService } from 'src/modules/pub-sub/pub-sub.service';
import { AppTool } from 'src/models';
import { PublishDto } from 'src/modules/pub-sub/dto/publish.dto';
import { PublishResponse } from 'src/modules/pub-sub/dto/publish.response';
import { ClientMetadataFromRequest } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';

@ApiTags('Pub/Sub')
@Controller('pub-sub')
@UsePipes(new ValidationPipe())
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
    @ClientMetadataFromRequest() clientMetadata: ClientMetadata,
      @Body() dto: PublishDto,
  ): Promise<PublishResponse> {
    return this.service.publish(clientMetadata, dto);
  }
}
