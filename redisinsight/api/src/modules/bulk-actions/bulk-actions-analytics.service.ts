import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error,
}

@Injectable()
export class BulkActionsAnalyticsService extends TelemetryBaseService {
  private events: Map<TelemetryEvents, Function> = new Map();

  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
    this.events.set(TelemetryEvents.BulkActionsStarted, this.sendActionStarted.bind(this));
    this.events.set(TelemetryEvents.BulkActionsStopped, this.sendActionStopped.bind(this));
  }

  sendActionStarted(overview: IBulkActionOverview): void {
    try {
      this.sendEvent(
        TelemetryEvents.BulkActionsStarted,
        {
          databaseId: overview.databaseId,
          type: overview.type,
          duration: overview.duration,
          filter: {
            match: overview.filter?.match === '*' ? '*' : 'PATTERN',
            type: overview.filter?.type,
          },
          progress: {
            scanned: overview.progress?.scanned,
            total: overview.progress?.total,
          },
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendActionStopped(overview: IBulkActionOverview): void {
    try {
      this.sendEvent(
        TelemetryEvents.BulkActionsStopped,
        {
          databaseId: overview.databaseId,
          type: overview.type,
          duration: overview.duration,
          filter: {
            match: overview.filter?.match === '*' ? '*' : 'PATTERN',
            type: overview.filter?.type,
          },
          progress: {
            scanned: overview.progress?.scanned,
            total: overview.progress?.total,
          },
          summary: {
            processed: overview.summary?.processed,
            succeed: overview.summary?.succeed,
            failed: overview.summary.failed,
          },
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  getEventsEmitters(): Map<TelemetryEvents, Function> {
    return this.events;
  }
}
