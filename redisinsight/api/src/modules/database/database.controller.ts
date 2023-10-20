import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { Database } from 'src/modules/database/models/database';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { UpdateDatabaseDto } from 'src/modules/database/dto/update.database.dto';
import { BuildType } from 'src/modules/server/models/server';
import { DeleteDatabasesDto } from 'src/modules/database/dto/delete.databases.dto';
import { DeleteDatabasesResponse } from 'src/modules/database/dto/delete.databases.response';
import { ClientMetadataParam } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { ExportDatabasesDto } from 'src/modules/database/dto/export.databases.dto';
import { ExportDatabase } from 'src/modules/database/models/export-database';
import { DatabaseResponse } from 'src/modules/database/dto/database.response';
import { classToClass } from 'src/utils';

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
        type: DatabaseResponse,
      },
    ],
  })
  async get(
    @Param('id') id: string,
  ): Promise<DatabaseResponse> {
    return classToClass(DatabaseResponse, await this.service.get(id));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('')
  @ApiEndpoint({
    description: 'Add database instance',
    statusCode: 201,
    excludeFor: [BuildType.RedisStack],
    responses: [
      {
        status: 201,
        description: 'Created database instance',
        type: DatabaseResponse,
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
  ): Promise<DatabaseResponse> {
    return classToClass(DatabaseResponse, await this.service.create(dto, true));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(new TimeoutInterceptor(ERROR_MESSAGES.CONNECTION_TIMEOUT))
  @Patch(':id')
  @ApiEndpoint({
    description: 'Update database instance by id',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Updated database instance\' response',
        type: DatabaseResponse,
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
  ): Promise<DatabaseResponse> {
    return classToClass(DatabaseResponse, await this.service.update(id, database, true));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(new TimeoutInterceptor(ERROR_MESSAGES.CONNECTION_TIMEOUT))
  @Post('clone/:id')
  @ApiEndpoint({
    description: 'Update database instance by id',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Updated database instance\' response',
        type: DatabaseResponse,
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
  async clone(
    @Param('id') id: string,
      @Body() database: UpdateDatabaseDto,
  ): Promise<DatabaseResponse> {
    return classToClass(DatabaseResponse, await this.service.clone(id, database));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/test')
  @ApiEndpoint({
    description: 'Test connection',
    statusCode: 200,
    responses: [
      {
        status: 200,
      },
    ],
  })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async testConnection(
    @Body() dto: CreateDatabaseDto,
  ): Promise<void> {
    return await this.service.testConnection(dto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/test/:id')
  @ApiEndpoint({
    description: 'Test connection',
    statusCode: 200,
    responses: [
      {
        status: 200,
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
  async testExistConnection(
    @Param('id') id: string,
      @Body() dto: UpdateDatabaseDto,
  ): Promise<void> {
    return this.service.testConnection(dto, id);
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
    @ClientMetadataParam({
      databaseIdParam: 'id',
      ignoreDbIndex: true,
    }) clientMetadata: ClientMetadata,
  ): Promise<void> {
    await this.connectionService.connect(clientMetadata);
  }

  @Post('export')
  @ApiEndpoint({
    statusCode: 201,
    excludeFor: [BuildType.RedisStack],
    description: 'Export many databases by ids. With or without passwords and certificates bodies.',
    responses: [
      {
        status: 201,
        description: 'Export many databases by ids response',
        type: ExportDatabase,
      },
    ],
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportConnections(
    @Body() dto: ExportDatabasesDto,
  ): Promise<ExportDatabase[]> {
    return await this.service.export(dto.ids, dto.withSecrets);
  }
}
