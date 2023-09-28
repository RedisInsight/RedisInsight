import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';

@Injectable()
export class CloudDatabaseAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendCloudFreeDatabaseCreated(eventData: object = {}) {
    this.sendEvent(TelemetryEvents.CloudFreeDatabaseCreated, eventData);
  }

  async sendCloudFreeDatabaseFailed(
    exception: HttpException,
    eventData: object = {},
  ) {
    try {
      this.sendFailedEvent(
        TelemetryEvents.CloudFreeDatabaseFailed,
        exception,
        eventData,
      );
    } catch (error) {
      // ignore
    }
  }
}
