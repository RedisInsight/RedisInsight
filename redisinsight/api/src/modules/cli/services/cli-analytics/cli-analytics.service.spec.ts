import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InternalServerErrorException } from '@nestjs/common';
import { mockRedisWrongTypeError, mockStandaloneDatabaseEntity } from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { AppTool, ReplyError } from 'src/models';
import { CliParsingError } from 'src/modules/cli/constants/errors';
import { ICliExecResultFromNode } from 'src/modules/cli/services/cli-tool/cli-tool.service';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { CliAnalyticsService } from './cli-analytics.service';

const redisReplyError: ReplyError = {
  ...mockRedisWrongTypeError,
  command: { name: 'sadd' },
};
const instanceId = mockStandaloneDatabaseEntity.id;
const httpException = new InternalServerErrorException();

describe('CliAnalyticsService', () => {
  let service: CliAnalyticsService;
  let sendEventMethod: jest.SpyInstance<CliAnalyticsService, unknown[]>;
  let sendFailedEventMethod: jest.SpyInstance<CliAnalyticsService, unknown[]>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        CliAnalyticsService,
      ],
    }).compile();

    service = module.get<CliAnalyticsService>(CliAnalyticsService);
    sendEventMethod = jest.spyOn<CliAnalyticsService, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<CliAnalyticsService, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendCliClientCreatedEvent', () => {
    it('should emit CliClientCreated event', () => {
      service.sendClientCreatedEvent(instanceId, 'cli', { data: 'Some data' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientCreated}`,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliClientCreated event without additional data', () => {
      service.sendClientCreatedEvent(instanceId, AppTool.CLI);

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientCreated}`,
        {
          databaseId: instanceId,
        },
      );
    });
  });

  describe('sendCliClientCreationFailedEvent', () => {
    it('should emit CliClientCreationFailed event', () => {
      service.sendClientCreationFailedEvent(instanceId, 'cli', httpException, { data: 'Some data' });

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientCreationFailed}`,
        httpException,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliClientCreationFailed event without additional data', () => {
      service.sendClientCreationFailedEvent(instanceId, 'cli', httpException);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientCreationFailed}`,
        httpException,
        {
          databaseId: instanceId,
        },
      );
    });
  });

  describe('sendCliClientRecreatedEvent', () => {
    it('should emit CliClientRecreated event', () => {
      service.sendClientRecreatedEvent(instanceId, 'cli', { data: 'Some data' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientRecreated}`,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliClientRecreated event without additional data', () => {
      service.sendClientRecreatedEvent(instanceId, 'cli');

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientRecreated}`,
        {
          databaseId: instanceId,
        },
      );
    });
  });

  describe('sendCliClientDeletedEvent', () => {
    it('should emit CliClientDeleted event', () => {
      service.sendClientDeletedEvent(1, instanceId, 'cli', { data: 'Some data' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientDeleted}`,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliClientDeleted event without additional data', () => {
      service.sendClientDeletedEvent(1, instanceId, 'cli');

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientDeleted}`,
        {
          databaseId: instanceId,
        },
      );
    });
    it('should not emit event', () => {
      service.sendClientDeletedEvent(0, instanceId, 'cli');

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
    it('should not emit event on invalid input values', () => {
      const input: any = {};
      service.sendClientDeletedEvent(input, instanceId, 'cli');

      expect(() => service.sendClientDeletedEvent(input, instanceId, 'cli')).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendCliCommandExecutedEvent', () => {
    it('should emit CliCommandExecuted event', () => {
      service.sendCommandExecutedEvent(instanceId, 'cli', { command: 'info' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.CommandExecuted}`,
        {
          databaseId: instanceId,
          command: 'info',
        },
      );
    });
    it('should emit CliCommandExecuted event without additional data', () => {
      service.sendCommandExecutedEvent(instanceId, 'cli');

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.CommandExecuted}`,
        {
          databaseId: instanceId,
        },
      );
    });
    it('should emit CliCommandExecuted for undefined namespace', () => {
      service.sendCommandExecutedEvent(instanceId, undefined, { command: 'info' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.CommandExecuted}`,
        {
          databaseId: instanceId,
          command: 'info',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event', () => {
      service.sendCommandExecutedEvent(instanceId, 'workbench', { command: 'info' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        `WORKBENCH_${TelemetryEvents.CommandExecuted}`,
        {
          databaseId: instanceId,
          command: 'info',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event without additional data', () => {
      service.sendCommandExecutedEvent(instanceId, 'workbench');

      expect(sendEventMethod).toHaveBeenCalledWith(
        `WORKBENCH_${TelemetryEvents.CommandExecuted}`,
        {
          databaseId: instanceId,
        },
      );
    });
  });

  describe('sendCliCommandErrorEvent', () => {
    it('should emit CliCommandError event', () => {
      service.sendCommandErrorEvent(instanceId, 'cli', redisReplyError, { data: 'Some data' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.CommandErrorReceived}`,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'sadd',
          data: 'Some data',
        },
      );
    });
    it('should emit CliCommandError event without additional data', () => {
      service.sendCommandErrorEvent(instanceId, 'cli', redisReplyError);

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.CommandErrorReceived}`,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'sadd',
        },
      );
    });
    it('should emit event for custom error', () => {
      const error: any = CliParsingError;
      service.sendCommandErrorEvent(instanceId, 'cli', error);

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.CommandErrorReceived}`,
        {
          databaseId: instanceId,
          error: CliParsingError.name,
        },
      );
    });
  });

  describe('sendCliClientCreationFailedEvent', () => {
    it('should emit CliConnectionError event', () => {
      service.sendConnectionErrorEvent(instanceId, 'cli', httpException, { data: 'Some data' });

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientConnectionError}`,
        httpException,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliConnectionError event without additional data', () => {
      service.sendConnectionErrorEvent(instanceId, 'cli', httpException);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClientConnectionError}`,
        httpException,
        {
          databaseId: instanceId,
        },
      );
    });
  });

  describe('sendCliClusterCommandExecutedEvent', () => {
    it('should emit success event', () => {
      const nodExecResult: ICliExecResultFromNode = {
        response: '(integer) 5',
        host: '127.0.0.1',
        port: 7002,
        status: CommandExecutionStatus.Success,
      };

      service.sendClusterCommandExecutedEvent(instanceId, 'cli', nodExecResult, { command: 'sadd' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.ClusterNodeCommandExecuted}`,
        {
          databaseId: instanceId,
          command: 'sadd',
        },
      );
    });
    it('should emit event failed event for [RedisReply] error', () => {
      const nodExecResult: ICliExecResultFromNode = {
        response: redisReplyError.message,
        host: '127.0.0.1',
        port: 7002,
        error: redisReplyError,
        status: CommandExecutionStatus.Fail,
      };

      service.sendClusterCommandExecutedEvent(instanceId, 'cli', nodExecResult);

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.CommandErrorReceived}`,
        {
          databaseId: instanceId,
          error: redisReplyError.name,
          command: 'sadd',
        },
      );
    });
    it('should emit event failed for custom error', () => {
      const nodExecResult: ICliExecResultFromNode = {
        response: redisReplyError.message,
        host: '127.0.0.1',
        port: 7002,
        error: CliParsingError,
        status: CommandExecutionStatus.Fail,
      };

      service.sendClusterCommandExecutedEvent(instanceId, 'cli', nodExecResult);

      expect(sendEventMethod).toHaveBeenCalledWith(
        `CLI_${TelemetryEvents.CommandErrorReceived}`,
        {
          databaseId: instanceId,
          error: CliParsingError.name,
        },
      );
    });
    it('should not emit event event', () => {
      const nodExecResult: any = {
        response: redisReplyError.message,
        host: '127.0.0.1',
        port: 7002,
        status: 'undefined status',
      };
      service.sendClusterCommandExecutedEvent(instanceId, 'cli', nodExecResult);

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });
});
