import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';

@Injectable()
export class RdiAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendRdiInstanceDeleted(numberOfInstances: number, error?: string) {
    try {
      this.sendEvent(TelemetryEvents.RdiInstanceDeleted, {
        numberOfInstances,
        error,
      });
    } catch (e) {
      // continue regardless of error
    }
  }
}
