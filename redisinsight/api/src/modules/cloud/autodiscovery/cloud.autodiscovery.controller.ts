import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post, Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { ApiTags } from '@nestjs/swagger';
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

@ApiTags('Cloud Autodiscovery')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('cloud/autodiscovery')
export class CloudAutodiscoveryController {
  constructor(private service: CloudAutodiscoveryService) {}

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
        type: CloudAccountInfo,
      },
    ],
  })
  async getAccount(@Body() dto: CloudAuthDto): Promise<CloudAccountInfo> {
    return await this.service.getAccount(dto);
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
        type: CloudSubscription,
        isArray: true,
      },
    ],
  })
  async getSubscriptions(@Body() dto: CloudAuthDto): Promise<CloudSubscription[]> {
    return await this.service.getSubscriptions(dto);
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
  async getDatabases(@Body() dto: GetCloudDatabasesDto): Promise<CloudDatabase[]> {
    return await this.service.getDatabases(dto);
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async addRedisCloudDatabases(
    @Body() dto: AddCloudDatabasesDto,
      @Res() res: Response,
  ): Promise<Response> {
    const { databases, ...connectionDetails } = dto;
    const result = await this.service.addRedisCloudDatabases(
      connectionDetails,
      databases,
    );
    const hasSuccessResult = result.some(
      (addResponse: AddCloudDatabaseResponse) => addResponse.status === ActionStatus.Success,
    );
    if (!hasSuccessResult) {
      return res.status(200).json(result);
    }
    return res.json(result);
  }
}
