import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/shared/services/base/telemetry.base.service';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error,
}

@Injectable()
export class ProfilerAnalyticsService extends TelemetryBaseService {
  private events: Map<TelemetryEvents, Function> = new Map();

  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
    this.events.set(TelemetryEvents.ProfilerLogDownloaded, this.sendLogDownloaded.bind(this));
    this.events.set(TelemetryEvents.ProfilerLogDeleted, this.sendLogDeleted.bind(this));
  }

  sendLogDeleted(databaseId: string, fileSize: number): void {
    try {
      this.sendEvent(
        TelemetryEvents.ProfilerLogDeleted,
        {
          databaseId,
          fileSize,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendLogDownloaded(databaseId: string, fileSize: number): void {
    try {
      this.sendEvent(
        TelemetryEvents.ProfilerLogDownloaded,
        {
          databaseId,
          fileSize,
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
