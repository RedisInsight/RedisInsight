import {
  Body,
  Controller,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import {
  ConsumerGroupDto, CreateConsumerGroupsDto,
  GetStreamEntriesResponse,
} from 'src/modules/browser/dto/stream.dto';
import { ConsumerGroupService } from 'src/modules/browser/services/stream/consumer-group.service';
import { KeyDto } from 'src/modules/browser/dto';

@ApiTags('Streams')
@Controller('streams/consumer-groups')
@UsePipes(new ValidationPipe({ transform: true }))
export class ConsumerGroupController {
  constructor(private service: ConsumerGroupService) {}

  @Post('/get')
  @ApiRedisInstanceOperation({
    description: 'Get stream entries',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns ordered stream entries in defined range.',
        type: GetStreamEntriesResponse,
      },
    ],
  })
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
}
