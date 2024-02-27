import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { ReplyError } from 'src/models';
import { CommandExecutionStatus, ICliExecResultFromNode } from 'src/modules/cli/dto/cli.dto';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandTelemetryBaseService } from 'src/modules/analytics/command.telemetry.base.service';

@Injectable()
export class CliAnalyticsService extends CommandTelemetryBaseService {
  constructor(
    protected eventEmitter: EventEmitter2,
    protected readonly commandsService: CommandsService,
  ) {
    super(eventEmitter, commandsService);
  }

  sendClientCreatedEvent(
    databaseId: string,
    additionalData: object = {},
  ): void {
    this.sendEvent(
      TelemetryEvents.CliClientCreated,
      {
        databaseId,
        ...additionalData,
      },
    );
  }

  sendClientCreationFailedEvent(
    databaseId: string,
    exception: HttpException,
    additionalData: object = {},
  ): void {
    this.sendFailedEvent(
      TelemetryEvents.CliClientCreationFailed,
      exception,
      {
        databaseId,
        ...additionalData,
      },
    );
  }

  sendClientRecreatedEvent(
    databaseId: string,
    additionalData: object = {},
  ): void {
    this.sendEvent(
      TelemetryEvents.CliClientRecreated,
      {
        databaseId,
        ...additionalData,
      },
    );
  }

  sendClientDeletedEvent(
    affected: number,
    databaseId: string,
    additionalData: object = {},
  ): void {
    try {
      if (affected > 0) {
        this.sendEvent(
          TelemetryEvents.CliClientDeleted,
          {
            databaseId,
            ...additionalData,
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendCommandExecutedEvent(
    databaseId: string,
    additionalData: object = {},
  ): Promise<void> {
    try {
      this.sendEvent(
        TelemetryEvents.CliCommandExecuted,
        {
          databaseId,
          ...(await this.getCommandAdditionalInfo(additionalData['command'])),
          ...additionalData,
        },
      );
    } catch (e) {
      // ignore error
    }
  }

  public async sendCommandErrorEvent(
    databaseId: string,
    error: ReplyError,
    additionalData: object = {},
  ): Promise<void> {
    try {
      this.sendEvent(
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId,
          error: error?.name,
          command: error?.command?.name,
          ...(await this.getCommandAdditionalInfo(additionalData['command'])),
          ...additionalData,
        },
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendClusterCommandExecutedEvent(
    databaseId: string,
    result: ICliExecResultFromNode,
    additionalData: object = {},
  ): Promise<void> {
    const { status, error } = result;
    try {
      if (status === CommandExecutionStatus.Success) {
        this.sendEvent(
          TelemetryEvents.CliClusterNodeCommandExecuted,
          {
            databaseId,
            ...(await this.getCommandAdditionalInfo(additionalData['command'])),
            ...additionalData,
          },
        );
      }
      if (status === CommandExecutionStatus.Fail) {
        this.sendEvent(
          TelemetryEvents.CliCommandErrorReceived,
          {
            databaseId,
            error: error.name,
            command: error?.command?.name,
            ...(await this.getCommandAdditionalInfo(additionalData['command'])),
            ...additionalData,
          },
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendConnectionErrorEvent(
    databaseId: string,
    exception: HttpException,
    additionalData: object = {},
  ): Promise<void> {
    this.sendFailedEvent(
      TelemetryEvents.CliClientConnectionError,
      exception,
      {
        databaseId,
        ...(await this.getCommandAdditionalInfo(additionalData['command'])),
        ...additionalData,
      },
    );
  }
}
