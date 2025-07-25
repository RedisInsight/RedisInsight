import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { DatabaseAnalysisService } from 'src/modules/database-analysis/database-analysis.service';
import {
  DatabaseAnalysis,
  ShortDatabaseAnalysis,
} from 'src/modules/database-analysis/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import {
  ApiQueryRedisStringEncoding,
  ClientMetadataParam,
} from 'src/common/decorators';
import {
  CreateDatabaseAnalysisDto,
  RecommendationVoteDto,
} from 'src/modules/database-analysis/dto';
import { ClientMetadata } from 'src/common/models';

@UseInterceptors(BrowserSerializeInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Database Analysis')
@Controller('/analysis')
export class DatabaseAnalysisController {
  constructor(private readonly service: DatabaseAnalysisService) {}

  @ApiEndpoint({
    statusCode: 201,
    description: 'Create new database analysis',
    responses: [
      {
        status: 201,
        type: DatabaseAnalysis,
      },
    ],
  })
  @Post()
  @ApiQueryRedisStringEncoding()
  @ApiParam({
    name: 'dbInstance',
    description: 'Database instance id',
    type: String,
  })
  async create(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
    @Body() dto: CreateDatabaseAnalysisDto,
  ): Promise<DatabaseAnalysis> {
    return this.service.create(clientMetadata, dto);
  }

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get database analysis',
    responses: [
      {
        status: 200,
        type: DatabaseAnalysis,
      },
    ],
  })
  @Get(':id')
  @ApiQueryRedisStringEncoding()
  @ApiParam({
    name: 'dbInstance',
    description: 'Database instance id',
    type: String,
  })
  @ApiParam({ name: 'id', description: 'Analysis id', type: String })
  async get(@Param('id') id: string): Promise<DatabaseAnalysis> {
    return this.service.get(id);
  }

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get database analysis list',
    responses: [
      {
        status: 200,
        type: [ShortDatabaseAnalysis],
      },
    ],
  })
  @Get('')
  @ApiQueryRedisStringEncoding()
  @ApiParam({
    name: 'dbInstance',
    description: 'Database instance id',
    type: String,
  })
  async list(
    @Param('dbInstance') databaseId: string,
  ): Promise<ShortDatabaseAnalysis[]> {
    return this.service.list(databaseId);
  }

  @Patch(':id')
  @ApiEndpoint({
    description: 'Update database analysis by id',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Updated database analysis response',
        type: DatabaseAnalysis,
      },
    ],
  })
  @ApiParam({
    name: 'dbInstance',
    description: 'Database instance id',
    type: String,
  })
  @ApiParam({ name: 'id', description: 'Analysis id', type: String })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async modify(
    @Param('id') id: string,
    @Body() dto: RecommendationVoteDto,
  ): Promise<DatabaseAnalysis> {
    return await this.service.vote(id, dto);
  }
}
