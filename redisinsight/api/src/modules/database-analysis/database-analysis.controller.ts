import {
  Body,
  Controller, Get, Param, Post, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';
import { DatabaseAnalysisService } from 'src/modules/database-analysis/database-analysis.service';
import { DatabaseAnalysis, ShortDatabaseAnalysis } from 'src/modules/database-analysis/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { ApiQueryRedisStringEncoding, ClientMetadataFromRequest } from 'src/common/decorators';
import { CreateDatabaseAnalysisDto } from 'src/modules/database-analysis/dto';
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
  async create(
    @ClientMetadataFromRequest() clientMetadata: ClientMetadata,
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
  async get(
    @Param('id') id: string,
  ): Promise<DatabaseAnalysis> {
    return this.service.get(id);
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
  @Get('')
  @ApiQueryRedisStringEncoding()
  async list(
    @Param('dbInstance') databaseId: string,
  ): Promise<ShortDatabaseAnalysis[]> {
    return this.service.list(databaseId);
  }
}
