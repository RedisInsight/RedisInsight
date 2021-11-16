import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TimeoutInterceptor } from 'src/modules/core/interceptors/timeout.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { RedisEnterpriseDatabase } from 'src/modules/redis-enterprise/dto/cluster.dto';
import {
  RedisCloudBusinessService,
} from 'src/modules/shared/services/redis-cloud-business/redis-cloud-business.service';
import {
  CloudAuthDto,
  GetCloudAccountShortInfoResponse,
  GetDatabasesInMultipleCloudSubscriptionsDto,
  RedisCloudDatabase,
  GetRedisCloudSubscriptionResponse,
} from 'src/modules/redis-enterprise/dto/cloud.dto';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';

@ApiTags('Redis Enterprise Cloud')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('cloud')
export class CloudController {
  constructor(private redisCloudService: RedisCloudBusinessService) {}

  @Post('get-account')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Get current account',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Account Details.',
        type: RedisEnterpriseDatabase,
      },
    ],
  })
  async getAccount(
    @Body() dto: CloudAuthDto,
  ): Promise<GetCloudAccountShortInfoResponse> {
    return await this.redisCloudService.getAccount(dto);
  }

  @Post('get-subscriptions')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Get information about current account’s subscriptions.',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Redis cloud subscription list.',
        type: GetRedisCloudSubscriptionResponse,
        isArray: true,
      },
    ],
  })
  async getSubscriptions(
    @Body() dto: CloudAuthDto,
  ): Promise<GetRedisCloudSubscriptionResponse[]> {
    return await this.redisCloudService.getSubscriptions(dto);
  }

  @Post('get-databases')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiEndpoint({
    description: 'Get databases belonging to subscriptions',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Databases list.',
        type: RedisCloudDatabase,
        isArray: true,
      },
    ],
  })
  async getDatabases(
    @Body() dto: GetDatabasesInMultipleCloudSubscriptionsDto,
  ): Promise<RedisCloudDatabase[]> {
    return await this.redisCloudService.getDatabasesInMultipleSubscriptions(
      dto,
    );
  }
}
