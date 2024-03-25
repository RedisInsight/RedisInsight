import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryEvents } from 'src/constants';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandTelemetryBaseService } from 'src/modules/analytics/command.telemetry.base.service';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error,
}

@Injectable()
export class WorkbenchAnalyticsService extends CommandTelemetryBaseService {
  constructor(
    protected eventEmitter: EventEmitter2,
    protected readonly commandsService: CommandsService,
  ) {
    super(eventEmitter, commandsService);
  }

  sendIndexInfoEvent(
    databaseId: string,
    additionalData: object,
  ): void {
    if (!additionalData) {
      return;
    }

    try {
      this.sendEvent(
        TelemetryEvents.WorkbenchIndexInfoSubmitted,
        {
          databaseId,
          ...additionalData,
        },
      );
    } catch (e) {
      // ignore error
    }
  }

  public async sendCommandExecutedEvents(
    databaseId: string,
    results: IExecResult[],
    additionalData: object = {},
  ): Promise<void> {
    try {
      await Promise.all(
        results.map(
          (result) => this.sendCommandExecutedEvent(databaseId, result, additionalData),
        ),
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendCommandExecutedEvent(
    databaseId: string,
    result: IExecResult,
    additionalData: object = {},
  ): Promise<void> {
    const { status } = result;
    try {
      if (status === CommandExecutionStatus.Success) {
        this.sendEvent(
          TelemetryEvents.WorkbenchCommandExecuted,
          {
            databaseId,
            ...(await this.getCommandAdditionalInfo(additionalData['command'])),
            ...additionalData,
          },
        );
      }
      if (status === CommandExecutionStatus.Fail) {
        this.sendCommandErrorEvent(databaseId, result.error, {
          ...(await this.getCommandAdditionalInfo(additionalData['command'])),
          ...additionalData,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  sendCommandDeletedEvent(databaseId: string, additionalData: object = {}): void {
    this.sendEvent(
      TelemetryEvents.WorkbenchCommandDeleted,
      {
        databaseId,
        ...additionalData,
      },
    );
  }

  private sendCommandErrorEvent(databaseId: string, error: any, additionalData: object = {}): void {
    try {
      if (error instanceof HttpException) {
        this.sendFailedEvent(
          TelemetryEvents.WorkbenchCommandErrorReceived,
          error,
          {
            databaseId,
            ...additionalData,
          },
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
