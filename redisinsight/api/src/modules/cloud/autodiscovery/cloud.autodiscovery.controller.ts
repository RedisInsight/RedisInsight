import {
  Body,
  ClassSerializerInterceptor,
  Controller, Get,
  Post, Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { ApiHeaders, ApiTags } from '@nestjs/swagger';
import { CloudAccountInfo, CloudDatabase, CloudSubscription } from 'src/modules/cloud/autodiscovery/models';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { Response } from 'express';
import { ActionStatus } from 'src/common/models';
import { BuildType } from 'src/modules/server/models/server';
import { CloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.service';
import {
  AddCloudDatabaseResponse,
  AddCloudDatabasesDto,
  CloudAuthDto,
  GetCloudDatabasesDto,
} from 'src/modules/cloud/autodiscovery/dto';
import { CloudAuthHeaders } from 'src/modules/cloud/autodiscovery/decorators/cloud-auth.decorator';
import config from 'src/utils/config';

const cloudConf = config.get('redis_cloud');

@ApiTags('Cloud Autodiscovery')
@ApiHeaders([{
  name: 'x-cloud-api-key',
}, {
  name: 'x-cloud-api-secret',
}])
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(new TimeoutInterceptor(undefined, cloudConf.cloudDiscoveryTimeout))
@Controller('cloud/autodiscovery')
export class CloudAutodiscoveryController {
  constructor(private service: CloudAutodiscoveryService) {}

  @Get('account')
  @ApiEndpoint({
    description: 'Get current account',
    statusCode: 200,
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 200,
        description: 'Account Details.',
        type: CloudAccountInfo,
      },
    ],
  })
  async getAccount(@CloudAuthHeaders() authDto: CloudAuthDto): Promise<CloudAccountInfo> {
    return await this.service.getAccount(authDto);
  }

  @Get('subscriptions')
  @ApiEndpoint({
    description: 'Get information about current account’s subscriptions.',
    statusCode: 200,
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 200,
        description: 'Redis cloud subscription list.',
        type: CloudSubscription,
        isArray: true,
      },
    ],
  })
  async getSubscriptions(@CloudAuthHeaders() authDto: CloudAuthDto): Promise<CloudSubscription[]> {
    return await this.service.getSubscriptions(authDto);
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
        type: CloudDatabase,
        isArray: true,
      },
    ],
  })
  async getDatabases(
    @CloudAuthHeaders() authDto: CloudAuthDto,
      @Body() dto: GetCloudDatabasesDto,
  ): Promise<CloudDatabase[]> {
    return await this.service.getDatabases(authDto, dto);
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
        type: AddCloudDatabaseResponse,
        isArray: true,
      },
    ],
  })
  async addRedisCloudDatabases(
    @CloudAuthHeaders() authDto: CloudAuthDto,
      @Body() dto: AddCloudDatabasesDto,
      @Res() res: Response,
  ): Promise<Response> {
    const { databases } = dto;
    const result = await this.service.addRedisCloudDatabases(authDto, databases);
    const hasSuccessResult = result.some(
      (addResponse: AddCloudDatabaseResponse) => addResponse.status === ActionStatus.Success,
    );
    if (!hasSuccessResult) {
      return res.status(200).json(result);
    }
    return res.json(result);
  }
}
