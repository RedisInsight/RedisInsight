import { Module } from '@nestjs/common';

import { RecommendationsService } from './providers/database-recommendations.provider';

@Module({
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class DatabaseRecommendationsModule {}
