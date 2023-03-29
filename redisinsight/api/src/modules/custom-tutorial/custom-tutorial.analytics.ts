import { Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';

@Injectable()
export class CustomTutorialAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendImportSucceeded(data: any = {}): void {
    this.sendEvent(
      TelemetryEvents.WorkbenchEnablementAreaImportSucceeded,
      {
        manifest: data?.manifest ? 'yes' : 'no',
      },
    );
  }

  sendImportFailed(e: Error): void {
    this.sendEvent(
      TelemetryEvents.WorkbenchEnablementAreaImportFailed,
      {
        error: e?.constructor?.name || 'UncaughtError',
      },
    );
  }
}
