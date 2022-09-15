import {
  Controller, Get, Param, Post,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ClusterDetails } from 'src/modules/cluster-monitor/models';
import { DatabaseAnalysisService } from 'src/modules/database-analysis/database-analysis.service';

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
        type: ClusterDetails,
      },
    ],
  })
  @Post()
  async create(
    @Param('dbInstance') instanceId: string,
  ): Promise<any> { // todo: DatabaseAnalysis
    return this.service.create({
      instanceId,
    });
  }
}
