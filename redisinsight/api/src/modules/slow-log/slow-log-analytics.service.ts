import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';

@Injectable()
export class SlowLogAnalyticsService extends TelemetryBaseService {
  private events: Map<TelemetryEvents, Function> = new Map();

  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
    this.events.set(TelemetryEvents.SlowlogSetLogSlowerThan, this.slowlogLogSlowerThanUpdated.bind(this));
    this.events.set(TelemetryEvents.SlowlogSetMaxLen, this.slowlogMaxLenUpdated.bind(this));
  }

  updateSlowlogConfig(event: TelemetryEvents, eventData: any): void {
    try {
      this.sendEvent(event, eventData);
    } catch (e) {
      // continue regardless of error
    }
  }

  slowlogMaxLenUpdated(databaseId: string, previousValue: number, currentValue: number): void {
    this.updateSlowlogConfig(
      TelemetryEvents.SlowlogSetMaxLen,
      {
        databaseId,
        previousValue,
        currentValue,
      },
    );
  }

  slowlogLogSlowerThanUpdated(databaseId: string, previousValue: number, currentValue: number): void {
    this.updateSlowlogConfig(
      TelemetryEvents.SlowlogSetLogSlowerThan,
      {
        databaseId,
        // convert microseconds to milliseconds
        previousValueInMSeconds: previousValue / 1_000,
        currentValueInMSeconds: currentValue / 1_000,
      },
    );
  }
}
