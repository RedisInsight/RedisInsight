import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post, Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TimeoutInterceptor } from 'src/modules/core/interceptors/timeout.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { RedisEnterpriseDatabase } from 'src/modules/redis-enterprise/dto/cluster.dto';
import {
  CloudAuthDto,
  GetCloudAccountShortInfoResponse,
  GetDatabasesInMultipleCloudSubscriptionsDto,
  GetRedisCloudSubscriptionResponse,
  RedisCloudDatabase,
} from 'src/modules/redis-enterprise/dto/cloud.dto';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { BuildType } from 'src/modules/core/models/server-provider.interface';
import { RedisCloudService } from 'src/modules/redis-enterprise/redis-cloud.service';
import {
  AddMultipleRedisCloudDatabasesDto,
  AddRedisCloudDatabaseResponse,
} from 'src/modules/redis-enterprise/dto/redis-enterprise-cloud.dto';
import { Response } from 'express';
import { ActionStatus } from 'src/common/models';

@ApiTags('Redis Enterprise Cloud')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('redis-enterprise/cloud')
export class CloudController {
  constructor(private redisCloudService: RedisCloudService) {}

  @Post('get-account')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Get current account',
    statusCode: 200,
    excludeFor: [BuildType.RedisStack],
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
    excludeFor: [BuildType.RedisStack],
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
    excludeFor: [BuildType.RedisStack],
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

  @Post('databases')
  @ApiEndpoint({
    description: 'Add databases from Redis Enterprise Cloud Pro account.',
    statusCode: 201,
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 201,
        description: 'Added databases list.',
        type: AddRedisCloudDatabaseResponse,
        isArray: true,
      },
    ],
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async addRedisCloudDatabases(
    @Body() dto: AddMultipleRedisCloudDatabasesDto,
      @Res() res: Response,
  ): Promise<Response> {
    const { databases, ...connectionDetails } = dto;
    const result = await this.redisCloudService.addRedisCloudDatabases(
      connectionDetails,
      databases,
    );
    const hasSuccessResult = result.some(
      (addResponse: AddRedisCloudDatabaseResponse) => addResponse.status === ActionStatus.Success,
    );
    if (!hasSuccessResult) {
      return res.status(200).json(result);
    }
    return res.json(result);
  }
}
