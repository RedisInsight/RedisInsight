import { Module } from '@nestjs/common';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';

@Module({
  providers: [
    AnalyticsService,
  ],
})
export class AnalyticsModule {}
