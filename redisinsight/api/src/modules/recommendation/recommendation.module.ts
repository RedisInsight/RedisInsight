import { Module } from '@nestjs/common';

import { RecommendationService } from './providers/recommendation.provider';

@Module({
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
