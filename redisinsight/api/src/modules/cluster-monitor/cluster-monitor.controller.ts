import { Controller, Get, Param } from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ClusterMonitorService } from 'src/modules/cluster-monitor/cluster-monitor.service';
import { AppTool } from 'src/models';
import { ApiTags } from '@nestjs/swagger';
import { ClusterDetails } from 'src/modules/cluster-monitor/dto';

@ApiTags('Cluster Monitor')
@Controller('/cluster-details')
export class ClusterMonitorController {
  constructor(private readonly clusterMonitorService: ClusterMonitorService) {}

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get list of available plugins',
    responses: [
      {
        status: 200,
        type: ClusterDetails,
      },
    ],
  })
  @Get()
  async getClusterDetails(
    @Param('dbInstance') instanceId: string,
  ): Promise<ClusterDetails> {
    return this.clusterMonitorService.getClusterDetails({
      instanceId,
      tool: AppTool.Common,
    });
  }
}
