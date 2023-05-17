import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { getRangeForNumber, BULK_ACTIONS_BREAKPOINTS } from 'src/utils';
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
    this.events.set(TelemetryEvents.BulkActionsSucceed, this.sendActionSucceed.bind(this));
    this.events.set(TelemetryEvents.BulkActionsFailed, this.sendActionFailed.bind(this));
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
            scannedRange: getRangeForNumber(overview.progress?.scanned, BULK_ACTIONS_BREAKPOINTS),
            total: overview.progress?.total,
            totalRange: getRangeForNumber(overview.progress?.total, BULK_ACTIONS_BREAKPOINTS),
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
            scannedRange: getRangeForNumber(overview.progress?.scanned, BULK_ACTIONS_BREAKPOINTS),
            total: overview.progress?.total,
            totalRange: getRangeForNumber(overview.progress?.total, BULK_ACTIONS_BREAKPOINTS),
          },
          summary: {
            processed: overview.summary?.processed,
            processedRange: getRangeForNumber(overview.summary?.processed, BULK_ACTIONS_BREAKPOINTS),
            succeed: overview.summary?.succeed,
            succeedRange: getRangeForNumber(overview.summary?.succeed, BULK_ACTIONS_BREAKPOINTS),
            failed: overview.summary.failed,
            failedFRange: getRangeForNumber(overview.summary.failed, BULK_ACTIONS_BREAKPOINTS),
          },
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendActionSucceed(overview: IBulkActionOverview): void {
    try {
      this.sendEvent(
        TelemetryEvents.BulkActionsSucceed,
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
            scannedRange: getRangeForNumber(overview.progress?.scanned, BULK_ACTIONS_BREAKPOINTS),
            total: overview.progress?.total,
            totalRange: getRangeForNumber(overview.progress?.total, BULK_ACTIONS_BREAKPOINTS),
          },
          summary: {
            processed: overview.summary?.processed,
            processedRange: getRangeForNumber(overview.summary?.processed, BULK_ACTIONS_BREAKPOINTS),
            succeed: overview.summary?.succeed,
            succeedRange: getRangeForNumber(overview.summary?.succeed, BULK_ACTIONS_BREAKPOINTS),
            failed: overview.summary.failed,
            failedFRange: getRangeForNumber(overview.summary.failed, BULK_ACTIONS_BREAKPOINTS),
          },
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendActionFailed(overview: IBulkActionOverview, error: HttpException | Error): void {
    try {
      this.sendEvent(
        TelemetryEvents.BulkActionsFailed,
        {
          databaseId: overview.databaseId,
          type: overview.type,
          error,
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
