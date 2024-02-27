import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { getRangeForNumber, BULK_ACTIONS_BREAKPOINTS } from 'src/utils';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';

@Injectable()
export class BulkActionsAnalytics extends TelemetryBaseService {
  sendActionStarted(overview: IBulkActionOverview): void {
    try {
      this.sendEvent(
        TelemetryEvents.BulkActionsStarted,
        {
          databaseId: overview.databaseId,
          action: overview.type,
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
          action: overview.type,
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
            failed: overview.summary?.failed,
            failedRange: getRangeForNumber(overview.summary?.failed, BULK_ACTIONS_BREAKPOINTS),
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
          action: overview.type,
          duration: overview.duration,
          filter: {
            match: overview.filter?.match === '*' ? '*' : 'PATTERN',
            type: overview.filter?.type,
          },
          summary: {
            processed: overview.summary?.processed,
            processedRange: getRangeForNumber(overview.summary?.processed, BULK_ACTIONS_BREAKPOINTS),
            succeed: overview.summary?.succeed,
            succeedRange: getRangeForNumber(overview.summary?.succeed, BULK_ACTIONS_BREAKPOINTS),
            failed: overview.summary?.failed,
            failedRange: getRangeForNumber(overview.summary?.failed, BULK_ACTIONS_BREAKPOINTS),
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
          action: overview.type,
          error,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }
}
