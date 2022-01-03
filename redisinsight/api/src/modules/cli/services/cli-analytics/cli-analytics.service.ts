import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/shared/services/base/telemetry.base.service';
import { AppTool, ReplyError } from 'src/models';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { ICliExecResultFromNode } from 'src/modules/shared/services/base/redis-tool.service';

@Injectable()
export class CliAnalyticsService extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }

  sendClientCreatedEvent(
    instanceId: string,
    namespace: string,
    additionalData: object = {},
  ): void {
    this.sendEvent(
      this.getNamespaceEvent(TelemetryEvents.ClientCreated, namespace),
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }

  sendClientCreationFailedEvent(
    instanceId: string,
    namespace: string,
    exception: HttpException,
    additionalData: object = {},
  ): void {
    this.sendFailedEvent(
      this.getNamespaceEvent(TelemetryEvents.ClientCreationFailed, namespace),
      exception,
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }

  sendClientRecreatedEvent(
    instanceId: string,
    namespace: string,
    additionalData: object = {},
  ): void {
    this.sendEvent(
      this.getNamespaceEvent(TelemetryEvents.ClientRecreated, namespace),
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }

  sendClientDeletedEvent(
    affected: number,
    instanceId: string,
    namespace: string,
    additionalData: object = {},
  ): void {
    try {
      if (affected > 0) {
        this.sendEvent(
          this.getNamespaceEvent(TelemetryEvents.ClientDeleted, namespace),
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

  sendCommandExecutedEvent(
    instanceId: string,
    namespace: string,
    additionalData: object = {},
  ): void {
    this.sendEvent(
      this.getNamespaceEvent(TelemetryEvents.CommandExecuted, namespace),
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }

  sendCommandErrorEvent(
    instanceId: string,
    namespace: string,
    error: ReplyError,
    additionalData: object = {},
  ): void {
    try {
      this.sendEvent(
        this.getNamespaceEvent(TelemetryEvents.CommandErrorReceived, namespace),
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

  sendClusterCommandExecutedEvent(
    instanceId: string,
    namespace: string,
    result: ICliExecResultFromNode,
    additionalData: object = {},
  ): void {
    const { status, error } = result;
    try {
      if (status === CommandExecutionStatus.Success) {
        this.sendEvent(
          this.getNamespaceEvent(TelemetryEvents.ClusterNodeCommandExecuted, namespace),
          {
            databaseId: instanceId,
            ...additionalData,
          },
        );
      }
      if (status === CommandExecutionStatus.Fail) {
        this.sendEvent(
          this.getNamespaceEvent(TelemetryEvents.CommandErrorReceived, namespace),
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

  sendConnectionErrorEvent(
    instanceId: string,
    namespace: string,
    exception: HttpException,
    additionalData: object = {},
  ): void {
    this.sendFailedEvent(
      this.getNamespaceEvent(TelemetryEvents.ClientConnectionError, namespace),
      exception,
      {
        databaseId: instanceId,
        ...additionalData,
      },
    );
  }

  private getNamespaceEvent(event: TelemetryEvents, namespace: string = AppTool.CLI): string {
    return namespace.toLowerCase() === 'workbench' ? `WORKBENCH_${event}` : `CLI_${event}`;
  }
}
