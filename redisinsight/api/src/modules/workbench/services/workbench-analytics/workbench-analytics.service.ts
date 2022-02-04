import { HttpException, Injectable } from '@nestjs/common';
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
export class WorkbenchAnalyticsService extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendCommandExecutedEvent(databaseId: string, result: IExecResult, additionalData: object = {}): void {
    const { status } = result;
    try {
      if (status === CommandExecutionStatus.Success) {
        this.sendEvent(
          TelemetryEvents.WorkbenchCommandExecuted,
          {
            databaseId,
            ...additionalData,
          },
        );
      }
      if (status === CommandExecutionStatus.Fail) {
        this.sendCommandErrorEvent(databaseId, result.error, additionalData);
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  private sendCommandErrorEvent(databaseId: string, error: any, additionalData: object = {}): void {
    try {
      if (error instanceof HttpException) {
        this.sendFailedEvent(
          TelemetryEvents.WorkbenchCommandErrorReceived,
          error,
          { databaseId, ...additionalData },
        );
      } else {
        this.sendEvent(
          TelemetryEvents.WorkbenchCommandErrorReceived,
          {
            databaseId,
            error: error.name,
            command: error?.command?.name,
            ...additionalData,
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }
}
