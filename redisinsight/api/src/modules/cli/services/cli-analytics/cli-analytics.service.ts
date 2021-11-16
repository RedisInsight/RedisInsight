import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/shared/services/base/telemetry.base.service';
import { ReplyError } from 'src/models';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { ICliExecResultFromNode } from 'src/modules/cli/services/cli-tool/cli-tool.service';

@Injectable()
export class CliAnalyticsService extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendCliClientCreatedEvent(instanceId: string, additionalData: object = {}): void {
    this.sendEvent(
      TelemetryEvents.CliClientCreated,
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }

  sendCliClientCreationFailedEvent(
    instanceId: string,
    exception: HttpException,
    additionalData: object = {},
  ): void {
    this.sendFailedEvent(
      TelemetryEvents.CliClientCreationFailed,
      exception,
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }

  sendCliClientRecreatedEvent(instanceId: string, additionalData: object = {}): void {
    this.sendEvent(
      TelemetryEvents.CliClientRecreated,
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }

  sendCliClientDeletedEvent(
    affected: number,
    instanceId: string,
    additionalData: object = {},
  ): void {
    try {
      if (affected > 0) {
        this.sendEvent(
          TelemetryEvents.CliClientDeleted,
          {
            databaseId: instanceId,
            ...additionalData,
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  sendCliCommandExecutedEvent(instanceId: string, additionalData: object = {}): void {
    this.sendEvent(
      TelemetryEvents.CliCommandExecuted,
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }

  sendCliClusterCommandExecutedEvent(
    instanceId: string,
    result: ICliExecResultFromNode,
    additionalData: object = {},
  ): void {
    const { status, error } = result;
    try {
      if (status === CommandExecutionStatus.Success) {
        this.sendEvent(
          TelemetryEvents.CliClusterNodeCommandExecuted,
          {
            databaseId: instanceId,
            ...additionalData,
          },
        );
      }
      if (status === CommandExecutionStatus.Fail) {
        this.sendEvent(
          TelemetryEvents.CliCommandErrorReceived,
          {
            databaseId: instanceId,
            error: error.name,
            command: error?.command?.name,
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  sendCliCommandErrorEvent(
    instanceId: string,
    error: ReplyError,
    additionalData: object = {},
  ): void {
    try {
      this.sendEvent(
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId: instanceId,
          error: error?.name,
          command: error?.command?.name,
          ...additionalData,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  sendCliConnectionErrorEvent(
    instanceId: string,
    exception: HttpException,
    additionalData: object = {},
  ): void {
    this.sendFailedEvent(
      TelemetryEvents.CliClientConnectionError,
      exception,
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }
}
