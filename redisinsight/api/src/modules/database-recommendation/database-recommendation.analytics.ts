import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { TelemetryEvents } from 'src/constants';
import { DatabaseRecommendation } from './models';
import { Database } from '../database/models/database';

@Injectable()
export class DatabaseRecommendationAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendCreatedRecommendationEvent(recommendation: DatabaseRecommendation, database: Database): void {
    try {
      this.sendEvent(
        TelemetryEvents.InsightsRecommendationGenerated,
        {
          recommendationName: recommendation.name,
          databaseId: database.id,
          provider: database.provider,
        },
      );
    } catch (e) {
    }
  }
}
