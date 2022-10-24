import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AppTool } from 'src/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { TimeoutInterceptor } from 'src/modules/core/interceptors/timeout.interceptor';
import { BuildType } from 'src/modules/core/models/server-provider.interface';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import {
  AddDatabaseInstanceDto,
  DatabaseInstanceResponse,
  DeleteDatabaseInstanceDto,
  DeleteDatabaseInstanceResponse,
  RenameDatabaseInstanceDto,
  RenameDatabaseInstanceResponse,
} from '../../dto/database-instance.dto';
import {
  AddRedisDatabaseStatus,
  AddRedisEnterpriseDatabaseResponse,
  AddRedisEnterpriseDatabasesDto,
} from '../../dto/redis-enterprise-cluster.dto';
import {
  AddMultipleRedisCloudDatabasesDto,
  AddRedisCloudDatabaseResponse,
} from '../../dto/redis-enterprise-cloud.dto';
import { RedisDatabaseInfoResponse } from '../../dto/redis-info.dto';

@ApiTags('Database Instances')
@Controller('')
export class InstancesController {
  constructor(private instancesBusinessService: InstancesBusinessService) {}
  //
  // @Post('redis-enterprise-dbs')
  // @ApiEndpoint({
  //   description: 'Add databases from Redis Enterprise cluster',
  //   statusCode: 201,
  //   excludeFor: [BuildType.RedisStack],
  //   responses: [
  //     {
  //       status: 201,
  //       description: 'Added databases list.',
  //       type: AddRedisEnterpriseDatabaseResponse,
  //       isArray: true,
  //     },
  //   ],
  // })
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async addRedisEnterpriseDatabases(
  //   @Body() dto: AddRedisEnterpriseDatabasesDto,
  //     @Res() res: Response,
  // ): Promise<Response> {
  //   const { uids, ...connectionDetails } = dto;
  //   const result = await this.instancesBusinessService.addRedisEnterpriseDatabases(
  //     connectionDetails,
  //     uids,
  //   );
  //   const hasSuccessResult = result.some(
  //     (addResponse: AddRedisEnterpriseDatabaseResponse) => addResponse.status === AddRedisDatabaseStatus.Success,
  //   );
  //   if (!hasSuccessResult) {
  //     return res.status(200).json(result);
  //   }
  //   return res.json(result);
  // }
  //
  // @Post('redis-cloud-dbs')
  // @ApiEndpoint({
  //   description: 'Add databases from Redis Enterprise Cloud Pro account.',
  //   statusCode: 201,
  //   excludeFor: [BuildType.RedisStack],
  //   responses: [
  //     {
  //       status: 201,
  //       description: 'Added databases list.',
  //       type: AddRedisCloudDatabaseResponse,
  //       isArray: true,
  //     },
  //   ],
  // })
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async addRedisCloudDatabases(
  //   @Body() dto: AddMultipleRedisCloudDatabasesDto,
  //     @Res() res: Response,
  // ): Promise<Response> {
  //   const { databases, ...connectionDetails } = dto;
  //   const result = await this.instancesBusinessService.addRedisCloudDatabases(
  //     connectionDetails,
  //     databases,
  //   );
  //   const hasSuccessResult = result.some(
  //     (addResponse: AddRedisCloudDatabaseResponse) => addResponse.status === AddRedisDatabaseStatus.Success,
  //   );
  //   if (!hasSuccessResult) {
  //     return res.status(200).json(result);
  //   }
  //   return res.json(result);
  // }

}
