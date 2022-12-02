import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { Database } from 'src/modules/database/models/database';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { AppTool } from 'src/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { UpdateDatabaseDto } from 'src/modules/database/dto/update.database.dto';
import { BuildType } from 'src/modules/server/models/server';
import { DeleteDatabasesDto } from 'src/modules/database/dto/delete.databases.dto';
import { DeleteDatabasesResponse } from 'src/modules/database/dto/delete.databases.response';

@ApiTags('Database')
@Controller('databases')
export class DatabaseController {
  constructor(
    private service: DatabaseService,
    private connectionService: DatabaseConnectionService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Get databases list',
    responses: [
      {
        status: 200,
        isArray: true,
        type: Database,
      },
    ],
  })
  async list(): Promise<Database[]> {
    return this.service.list();
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
        type: Database,
      },
    ],
  })
  async get(
    @Param('id') id: string,
  ): Promise<Database> {
    return await this.service.get(id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(new TimeoutInterceptor(ERROR_MESSAGES.CONNECTION_TIMEOUT))
  @Post('')
  @ApiEndpoint({
    description: 'Add database instance',
    statusCode: 201,
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 201,
        description: 'Created database instance',
        type: Database,
      },
    ],
  })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async create(
    @Body() dto: CreateDatabaseDto,
  ): Promise<Database> {
    return await this.service.create(dto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(new TimeoutInterceptor(ERROR_MESSAGES.CONNECTION_TIMEOUT))
  @Put(':id')
  @ApiEndpoint({
    description: 'Update database instance by id',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Updated database instance\' response',
        type: Database,
      },
    ],
  })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async update(
    @Param('id') id: string,
      @Body() database: UpdateDatabaseDto,
  ): Promise<Database> {
    return await this.service.update(id, database, true);
  }

  @Delete('/:id')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Delete database instance by id',
    excludeFor: [BuildType.RedisStack],
  })
  async deleteDatabaseInstance(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }

  @Delete('')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Delete many databases by ids',
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 200,
        description: 'Delete many databases by ids response',
        type: DeleteDatabasesDto,
      },
    ],
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async bulkDeleteDatabaseInstance(
    @Body() dto: DeleteDatabasesDto,
  ): Promise<DeleteDatabasesResponse> {
    return await this.service.bulkDelete(dto.ids);
  }

  @Get(':id/connect')
  @UseInterceptors(new TimeoutInterceptor(ERROR_MESSAGES.CONNECTION_TIMEOUT))
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
  async connect(
    @Param('id') id: string,
  ): Promise<void> {
    await this.connectionService.connect(
      id,
      AppTool.Common,
    );
  }
}
