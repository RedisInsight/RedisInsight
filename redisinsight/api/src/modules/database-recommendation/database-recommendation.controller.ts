import { Controller, Get, Patch } from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ApiTags } from '@nestjs/swagger';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ClientMetadata } from 'src/common/models';
import {
  DatabaseRecommendationsResponse,
} from 'src/modules/database-recommendation/dto/database-recommendations.response';

@ApiTags('Database Recommendations')
@Controller('/recommendations')
export class DatabaseRecommendationController {
  constructor(private service: DatabaseRecommendationService) {}

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get database recommendations',
    responses: [
      {
        status: 200,
        type: DatabaseRecommendationsResponse,
      },
    ],
  })
  @Get('')
  async list(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<DatabaseRecommendationsResponse> {
    return this.service.list(clientMetadata);
  }

  @Patch('/read')
  @ApiRedisParams()
  @ApiEndpoint({
    statusCode: 200,
    description: 'Mark all database recommendations as read',
    responses: [
      {
        status: 200,
      },
    ],
  })
  async read(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<void> {
    return this.service.read(clientMetadata);
  }
}
