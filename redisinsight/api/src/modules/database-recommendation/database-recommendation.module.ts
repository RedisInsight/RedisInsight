import { Module } from '@nestjs/common';
import { DatabaseRecommendationController }
  from 'src/modules/database-recommendation/database-recommendation.controller';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { DatabaseRecommendationProvider }
  from 'src/modules/database-recommendation/providers/database-recommendation.provider';
import { RecommendationScanner } from 'src/modules/database-recommendation/scanner/recommendations.scanner';
import { RecommendationProvider } from 'src/modules/database-recommendation/scanner/recommendation.provider';

@Module({
  controllers: [DatabaseRecommendationController],
  providers: [
    DatabaseRecommendationService,
    DatabaseRecommendationProvider,
    RecommendationScanner,
    RecommendationProvider,
  ],
  exports: [DatabaseRecommendationService, RecommendationScanner],
})
export class DatabaseRecommendationModule {}
