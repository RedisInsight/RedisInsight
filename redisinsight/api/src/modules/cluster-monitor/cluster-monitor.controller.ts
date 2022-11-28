import { Controller, Get } from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ClusterMonitorService } from 'src/modules/cluster-monitor/cluster-monitor.service';
import { ApiTags } from '@nestjs/swagger';
import { ClusterDetails } from 'src/modules/cluster-monitor/models';
import { ClientMetadataFromRequest } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';

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
    @ClientMetadataFromRequest() clientMetadata: ClientMetadata,
  ): Promise<ClusterDetails> {
    return this.clusterMonitorService.getClusterDetails(clientMetadata);
  }
}
