import { ApiTags } from '@nestjs/swagger';
import {
  Controller, Get, UseInterceptors,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { DatabaseInfoService } from 'src/modules/database/database-info.service';
import { DatabaseOverview } from 'src/modules/database/models/database-overview';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { ClientMetadata } from 'src/common/models';
import { ClientMetadataParam } from 'src/common/decorators';

@ApiTags('Database Instances')
@Controller('databases')
export class DatabaseInfoController {
  constructor(
    private databaseInfoService: DatabaseInfoService,
  ) {}

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
  async getInfo(
    @ClientMetadataParam({
      databaseIdParam: 'id',
    }) clientMetadata: ClientMetadata,
  ): Promise<RedisDatabaseInfoResponse> {
    return this.databaseInfoService.getInfo(clientMetadata);
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
    @ClientMetadataParam({
      databaseIdParam: 'id',
    }) clientMetadata: ClientMetadata,
  ): Promise<DatabaseOverview> {
    return this.databaseInfoService.getOverview(clientMetadata);
  }
}
