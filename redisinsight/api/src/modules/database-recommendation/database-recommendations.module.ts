import { Module } from '@nestjs/common';
import { DatabaseRecommendationsController }
  from 'src/modules/database-recommendation/database-recommendations.controller';
import { DatabaseRecommendationsService } from 'src/modules/database-recommendation/database-recommendations.service';
import { DatabaseRecommendationsProvider }
  from 'src/modules/database-recommendation/providers/database-recommendations.provider';
import { RecommendationScanner } from 'src/modules/database-recommendation/scanner/recommendations.scanner';
import { RecommendationProvider } from 'src/modules/database-recommendation/scanner/recommendation.provider';

@Module({
  controllers: [DatabaseRecommendationsController],
  providers: [
    DatabaseRecommendationsService,
    DatabaseRecommendationsProvider,
    RecommendationScanner,
    RecommendationProvider,
  ],
  exports: [DatabaseRecommendationsService, RecommendationScanner],
})
export class DatabaseRecommendationsModule {}
