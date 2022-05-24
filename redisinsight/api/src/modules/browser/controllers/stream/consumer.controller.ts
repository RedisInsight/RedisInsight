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
  ConsumerDto,
  ConsumerGroupDto,
  GetConsumersDto,
} from 'src/modules/browser/dto/stream.dto';
import { ConsumerService } from 'src/modules/browser/services/stream/consumer.service';

@ApiTags('Streams')
@Controller('streams/consumer-groups/consumers')
@UsePipes(new ValidationPipe({ transform: true }))
export class ConsumerController {
  constructor(private service: ConsumerService) {}

  @Post('/get')
  @ApiRedisInstanceOperation({
    description: 'Get stream entries',
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
  async getConsumers(
    @Param('dbInstance') instanceId: string,
      @Body() dto: GetConsumersDto,
  ): Promise<ConsumerDto[]> {
    return this.service.getConsumers({ instanceId }, dto);
  }
}
