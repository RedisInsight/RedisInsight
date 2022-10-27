import { ApiTags } from '@nestjs/swagger';
import {
  Controller, Get, Param, UseInterceptors,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { TimeoutInterceptor } from 'src/modules/core/interceptors/timeout.interceptor';
import { AppTool } from 'src/models';
import { RedisDatabaseInfoResponse } from 'src/modules/instances/dto/redis-info.dto';
import { DatabaseInfoService } from 'src/modules/database/database-info.service';
import { DatabaseOverview } from 'src/modules/database/models/database-overview';

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
    @Param('id') id: string,
  ): Promise<RedisDatabaseInfoResponse> {
    return this.databaseInfoService.getInfo(
      id,
      AppTool.Common,
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
    return this.databaseInfoService.getOverview(id);
  }
}
