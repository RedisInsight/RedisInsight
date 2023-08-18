import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';

@Injectable()
export class CloudCapiKeyAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendCloudAccountKeyGenerated() {
    try {
      this.sendEvent(
        TelemetryEvents.CloudAccountKeyGenerated,
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendCloudAccountKeyGenerationFailed(exception: HttpException) {
    this.sendFailedEvent(
      TelemetryEvents.CloudAccountKeyGenerationFailed,
      exception,
    );
  }
}
