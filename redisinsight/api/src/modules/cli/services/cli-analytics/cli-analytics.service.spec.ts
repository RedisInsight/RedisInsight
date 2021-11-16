import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InternalServerErrorException } from '@nestjs/common';
import { mockRedisWrongTypeError, mockStandaloneDatabaseEntity } from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { ReplyError } from 'src/models';
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
      service.sendCliClientCreatedEvent(instanceId, { data: 'Some data' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientCreated,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliClientCreated event without additional data', () => {
      service.sendCliClientCreatedEvent(instanceId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientCreated,
        {
          databaseId: instanceId,
        },
      );
    });
  });

  describe('sendCliClientCreationFailedEvent', () => {
    it('should emit CliClientCreationFailed event', () => {
      service.sendCliClientCreationFailedEvent(instanceId, httpException, { data: 'Some data' });

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientCreationFailed,
        httpException,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliClientCreationFailed event without additional data', () => {
      service.sendCliClientCreationFailedEvent(instanceId, httpException);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientCreationFailed,
        httpException,
        {
          databaseId: instanceId,
        },
      );
    });
  });

  describe('sendCliClientRecreatedEvent', () => {
    it('should emit CliClientRecreated event', () => {
      service.sendCliClientRecreatedEvent(instanceId, { data: 'Some data' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientRecreated,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliClientRecreated event without additional data', () => {
      service.sendCliClientRecreatedEvent(instanceId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientRecreated,
        {
          databaseId: instanceId,
        },
      );
    });
  });

  describe('sendCliClientDeletedEvent', () => {
    it('should emit CliClientDeleted event', () => {
      service.sendCliClientDeletedEvent(1, instanceId, { data: 'Some data' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientDeleted,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliClientDeleted event without additional data', () => {
      service.sendCliClientDeletedEvent(1, instanceId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientDeleted,
        {
          databaseId: instanceId,
        },
      );
    });
    it('should not emit event', () => {
      service.sendCliClientDeletedEvent(0, instanceId);

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
    it('should not emit event on invalid input values', () => {
      const input: any = {};
      service.sendCliClientDeletedEvent(input, instanceId);

      expect(() => service.sendCliClientDeletedEvent(input, instanceId)).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendCliCommandExecutedEvent', () => {
    it('should emit CliCommandExecuted event', () => {
      service.sendCliCommandExecutedEvent(instanceId, { command: 'info' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliCommandExecuted,
        {
          databaseId: instanceId,
          command: 'info',
        },
      );
    });
    it('should emit CliCommandExecuted event without additional data', () => {
      service.sendCliCommandExecutedEvent(instanceId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliCommandExecuted,
        {
          databaseId: instanceId,
        },
      );
    });
  });

  describe('sendCliCommandErrorEvent', () => {
    it('should emit CliCommandError event', () => {
      service.sendCliCommandErrorEvent(instanceId, redisReplyError, { data: 'Some data' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'sadd',
          data: 'Some data',
        },
      );
    });
    it('should emit CliCommandError event without additional data', () => {
      service.sendCliCommandErrorEvent(instanceId, redisReplyError);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'sadd',
        },
      );
    });
    it('should emit event for custom error', () => {
      const error: any = CliParsingError;
      service.sendCliCommandErrorEvent(instanceId, error);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId: instanceId,
          error: CliParsingError.name,
        },
      );
    });
  });

  describe('sendCliClientCreationFailedEvent', () => {
    it('should emit CliConnectionError event', () => {
      service.sendCliConnectionErrorEvent(instanceId, httpException, { data: 'Some data' });

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientConnectionError,
        httpException,
        {
          databaseId: instanceId,
          data: 'Some data',
        },
      );
    });
    it('should emit CliConnectionError event without additional data', () => {
      service.sendCliConnectionErrorEvent(instanceId, httpException);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClientConnectionError,
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

      service.sendCliClusterCommandExecutedEvent(instanceId, nodExecResult, { command: 'sadd' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliClusterNodeCommandExecuted,
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

      service.sendCliClusterCommandExecutedEvent(instanceId, nodExecResult);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliCommandErrorReceived,
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

      service.sendCliClusterCommandExecutedEvent(instanceId, nodExecResult);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CliCommandErrorReceived,
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
      service.sendCliClusterCommandExecutedEvent(instanceId, nodExecResult);

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });
});
