import {
  Body,
  Controller, Delete,
  Param, Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import {
  ConsumerGroupDto,
  CreateConsumerGroupsDto,
  DeleteConsumerGroupsDto,
  DeleteConsumerGroupsResponse,
  UpdateConsumerGroupDto,
} from 'src/modules/browser/dto/stream.dto';
import { ConsumerGroupService } from 'src/modules/browser/services/stream/consumer-group.service';
import { KeyDto } from 'src/modules/browser/dto';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';

@ApiTags('Streams')
@Controller('streams/consumer-groups')
export class ConsumerGroupController extends BaseController {
  constructor(private service: ConsumerGroupService) {
    super();
  }

  @Post('/get')
  @ApiRedisInstanceOperation({
    description: 'Get consumer groups list',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns stream consumer groups.',
        type: ConsumerGroupDto,
        isArray: true,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getGroups(
    @Param('dbInstance') instanceId: string,
      @Body() dto: KeyDto,
  ): Promise<ConsumerGroupDto[]> {
    return this.service.getGroups({ instanceId }, dto);
  }

  @Post('')
  @ApiRedisInstanceOperation({
    description: 'Create stream consumer group',
    statusCode: 201,
  })
  async createGroups(
    @Param('dbInstance') instanceId: string,
      @Body() dto: CreateConsumerGroupsDto,
  ): Promise<void> {
    return this.service.createGroups({ instanceId }, dto);
  }

  @Patch('')
  @ApiRedisInstanceOperation({
    description: 'Modify last delivered ID of the Consumer Group',
    statusCode: 200,
  })
  async updateGroup(
    @Param('dbInstance') instanceId: string,
      @Body() dto: UpdateConsumerGroupDto,
  ): Promise<void> {
    return this.service.updateGroup({ instanceId }, dto);
  }

  @Delete('')
  @ApiRedisInstanceOperation({
    description: 'Delete Consumer Group',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns number of affected consumer groups.',
        type: DeleteConsumerGroupsResponse,
      },
    ],
  })
  async deleteGroup(
    @Param('dbInstance') instanceId: string,
      @Body() dto: DeleteConsumerGroupsDto,
  ): Promise<DeleteConsumerGroupsResponse> {
    return this.service.deleteGroup({ instanceId }, dto);
  }
}
