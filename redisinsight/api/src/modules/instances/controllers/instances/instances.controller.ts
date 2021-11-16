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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AppTool } from 'src/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { TimeoutInterceptor } from 'src/modules/core/interceptors/timeout.interceptor';
import {
  AddSentinelMasterResponse,
  AddSentinelMastersDto,
} from 'src/modules/instances/dto/redis-sentinel.dto';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { DatabaseOverview } from 'src/modules/instances/dto/database-overview.dto';
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

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Get database instance list',
    responses: [
      {
        status: 200,
        description: 'Database instance list',
        isArray: true,
        type: DatabaseInstanceResponse,
      },
    ],
  })
  async getAll(): Promise<DatabaseInstanceResponse[]> {
    return this.instancesBusinessService.getAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:id')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Get database instance by id',
    responses: [
      {
        status: 200,
        description: 'Database instance',
        type: DatabaseInstanceResponse,
      },
    ],
  })
  async getOneById(
    @Param('id') id: string,
  ): Promise<DatabaseInstanceResponse> {
    return await this.instancesBusinessService.getOneById(id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(new TimeoutInterceptor(ERROR_MESSAGES.CONNECTION_TIMEOUT))
  @Post('')
  @ApiOperation({ description: 'Add database instance' })
  @ApiBody({ type: AddDatabaseInstanceDto })
  @ApiOkResponse({
    description: 'Created database instance',
    type: DatabaseInstanceResponse,
  })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async addDatabase(
    @Body() addInstanceDto: AddDatabaseInstanceDto,
  ): Promise<DatabaseInstanceResponse> {
    return await this.instancesBusinessService.addDatabase(addInstanceDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(new TimeoutInterceptor(ERROR_MESSAGES.CONNECTION_TIMEOUT))
  @Put(':id')
  @ApiOperation({ description: 'Update database instance by id' })
  @ApiBody({ type: AddDatabaseInstanceDto })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Updated database instance',
    type: DatabaseInstanceResponse,
  })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async updateDatabaseInstance(
    @Param('id') id: string,
      @Body() database: AddDatabaseInstanceDto,
  ): Promise<DatabaseInstanceResponse> {
    return await this.instancesBusinessService.update(id, database);
  }

  @Patch(':id/name')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Rename database instance by id',
    responses: [
      {
        status: 200,
        description: 'New database instance name',
        type: RenameDatabaseInstanceResponse,
      },
    ],
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async renameDatabaseInstance(
    @Param('id') id: string,
      @Body() dto: RenameDatabaseInstanceDto,
  ): Promise<RenameDatabaseInstanceResponse> {
    return await this.instancesBusinessService.rename(id, dto.newName);
  }

  @Delete('/:id')
  @ApiOperation({ description: 'Delete database instance by id' })
  @ApiParam({ name: 'id', type: String })
  async deleteDatabaseInstance(@Param('id') id: string): Promise<void> {
    await this.instancesBusinessService.delete(id);
  }

  @Delete('')
  @ApiOperation({ description: 'Delete many database instances by ids' })
  @ApiBody({ type: DeleteDatabaseInstanceDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async bulkDeleteDatabaseInstance(
    @Body() dto: DeleteDatabaseInstanceDto,
  ): Promise<DeleteDatabaseInstanceResponse> {
    return await this.instancesBusinessService.bulkDelete(dto.ids);
  }

  @Get(':id/connect')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Connect to database instance by id',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Successfully connected to database instance',
      },
    ],
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async connectToDatabaseInstance(
    @Param('id') id: string,
  ): Promise<void> {
    await this.instancesBusinessService.connectToInstance(
      id,
      AppTool.Common,
      true,
    );
  }

  @Get(':id/info')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Get Redis database config info',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Redis database info',
        type: RedisDatabaseInfoResponse,
      },
    ],
  })
  async getDatabaseInfo(
    @Param('id') id: string,
  ): Promise<RedisDatabaseInfoResponse> {
    return this.instancesBusinessService.getInfo(
      id,
      AppTool.Common,
      true,
    );
  }

  @Get(':id/overview')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Get Redis database overview',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Redis database overview',
        type: DatabaseOverview,
      },
    ],
  })
  async getDatabaseOverview(
    @Param('id') id: string,
  ): Promise<DatabaseOverview> {
    return this.instancesBusinessService.getOverview(id);
  }

  @Get(':id/plugin-commands')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Get Redis Commands available for plugins',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'List of available commands',
        type: [String],
      },
    ],
  })
  async getPluginCommands(
    @Param('id') id: string,
  ): Promise<string[]> {
    return this.instancesBusinessService.getPluginCommands(id);
  }

  @Post('redis-enterprise-dbs')
  @ApiEndpoint({
    description: 'Add databases from Redis Enterprise cluster',
    statusCode: 201,
    responses: [
      {
        status: 201,
        description: 'Added databases list.',
        type: AddRedisEnterpriseDatabaseResponse,
        isArray: true,
      },
    ],
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async addRedisEnterpriseDatabases(
    @Body() dto: AddRedisEnterpriseDatabasesDto,
      @Res() res: Response,
  ): Promise<Response> {
    const { uids, ...connectionDetails } = dto;
    const result = await this.instancesBusinessService.addRedisEnterpriseDatabases(
      connectionDetails,
      uids,
    );
    const hasSuccessResult = result.some(
      (addResponse: AddRedisEnterpriseDatabaseResponse) => addResponse.status === AddRedisDatabaseStatus.Success,
    );
    if (!hasSuccessResult) {
      return res.status(200).json(result);
    }
    return res.json(result);
  }

  @Post('redis-cloud-dbs')
  @ApiEndpoint({
    description: 'Add databases from Redis Enterprise Cloud Pro account.',
    statusCode: 201,
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
    const result = await this.instancesBusinessService.addRedisCloudDatabases(
      connectionDetails,
      databases,
    );
    const hasSuccessResult = result.some(
      (addResponse: AddRedisCloudDatabaseResponse) => addResponse.status === AddRedisDatabaseStatus.Success,
    );
    if (!hasSuccessResult) {
      return res.status(200).json(result);
    }
    return res.json(result);
  }

  @UseInterceptors(new TimeoutInterceptor(ERROR_MESSAGES.CONNECTION_TIMEOUT))
  @Post('sentinel-masters')
  @ApiEndpoint({
    statusCode: 201,
    description: 'Add masters from Redis Sentinel',
    responses: [
      {
        status: 201,
        description: 'Ok',
        type: AddSentinelMasterResponse,
        isArray: true,
      },
    ],
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async addSentinelMasters(
    @Body() dto: AddSentinelMastersDto,
      @Res() res: Response,
  ): Promise<Response> {
    const result = await this.instancesBusinessService.addSentinelMasters(dto);
    const hasSuccessResult = result.some(
      (addResponse: AddSentinelMasterResponse) => addResponse.status === AddRedisDatabaseStatus.Success,
    );
    if (!hasSuccessResult) {
      return res.status(200).json(result);
    }
    return res.json(result);
  }
}
