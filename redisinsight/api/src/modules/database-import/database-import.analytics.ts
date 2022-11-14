import { Injectable } from '@nestjs/common';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { DatabaseImportResponse } from 'src/modules/database-import/dto/database-import.response';

@Injectable()
export class DatabaseImportAnalytics extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendImportResults(importResult: DatabaseImportResponse): void {
    if (importResult.success) {
      this.sendEvent(
        TelemetryEvents.DatabaseImportSucceeded,
        {
          succeed: importResult.success,
        },
      );
    }

    if (importResult.errors?.length) {
      this.sendEvent(
        TelemetryEvents.DatabaseImportFailed,
        {
          failed: importResult.errors.length,
          errors: importResult.errors.map((e) => (e?.constructor?.name || 'UncaughtError')),
        },
      );
    }
  }

  sendImportFailed(e: Error): void {
    this.sendEvent(
      TelemetryEvents.DatabaseImportParseFailed,
      {
        error: e?.constructor?.name || 'UncaughtError',
      },
    );
  }
}
