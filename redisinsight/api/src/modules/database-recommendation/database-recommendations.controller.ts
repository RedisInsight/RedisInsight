import { Controller, Get, Patch } from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ApiTags } from '@nestjs/swagger';
import { DatabaseRecommendationsService } from 'src/modules/database-recommendation/database-recommendations.service';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { Recommendation } from 'src/modules/database-recommendation/models';
import { RecommendationsDto } from 'src/modules/database-recommendation/dto';
import { ClientMetadata } from 'src/common/models';

@ApiTags('Database Recommendations')
@Controller('/recommendations')
export class DatabaseRecommendationsController {
  constructor(private service: DatabaseRecommendationsService) {}

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get database recommendations',
    responses: [
      {
        status: 200,
        type: Recommendation,
      },
    ],
  })
  @Get('')
  async list(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<RecommendationsDto> {
    return this.service.list(clientMetadata);
  }

  @Patch('/read')
  @ApiRedisParams()
  @ApiEndpoint({
    statusCode: 200,
    description: 'Get database recommendations',
    responses: [
      {
        status: 200,
        type: Recommendation,
      },
    ],
  })
  async read(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<RecommendationsDto> {
    return this.service.read(clientMetadata);
  }
}
