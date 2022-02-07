import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockRedisWrongTypeError, mockStandaloneDatabaseEntity } from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { ReplyError } from 'src/models';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { CommandParsingError } from 'src/modules/cli/constants/errors';
import { WorkbenchAnalyticsService } from './workbench-analytics.service';

const redisReplyError: ReplyError = {
  ...mockRedisWrongTypeError,
  command: { name: 'sadd' },
};
const instanceId = mockStandaloneDatabaseEntity.id;

describe('WorkbenchAnalyticsService', () => {
  let service: WorkbenchAnalyticsService;
  let sendEventMethod: jest.SpyInstance<WorkbenchAnalyticsService, unknown[]>;
  let sendFailedEventMethod: jest.SpyInstance<WorkbenchAnalyticsService, unknown[]>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        WorkbenchAnalyticsService,
      ],
    }).compile();

    service = module.get<WorkbenchAnalyticsService>(WorkbenchAnalyticsService);
    sendEventMethod = jest.spyOn<WorkbenchAnalyticsService, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<WorkbenchAnalyticsService, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendCommandExecutedEvent', () => {
    it('should emit WorkbenchCommandExecuted event', () => {
      service.sendCommandExecutedEvent(
        instanceId,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'info' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'info',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event without additional data', () => {
      service.sendCommandExecutedEvent(
        instanceId,
        { response: 'OK', status: CommandExecutionStatus.Success },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
        },
      );
    });
    it('should emit WorkbenchCommandError event', () => {
      service.sendCommandExecutedEvent(
        instanceId,
        { response: 'Error', error: redisReplyError, status: CommandExecutionStatus.Fail },
        { data: 'Some data' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandErrorReceived,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'sadd',
          data: 'Some data',
        },
      );
    });
    it('should emit WorkbenchCommandError event without additional data', () => {
      service.sendCommandExecutedEvent(
        instanceId,
        { response: 'Error', error: redisReplyError, status: CommandExecutionStatus.Fail },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandErrorReceived,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'sadd',
        },
      );
    });
    it('should emit WorkbenchCommandError event for custom error', () => {
      const error: any = CommandParsingError;
      service.sendCommandExecutedEvent(
        instanceId,
        { response: 'Error', status: CommandExecutionStatus.Fail, error },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandErrorReceived,
        {
          databaseId: instanceId,
          error: CommandParsingError.name,
          command: undefined,
        },
      );
    });
    it('should emit WorkbenchCommandError event for HttpException', () => {
      const error = new ServiceUnavailableException();
      service.sendCommandExecutedEvent(
        instanceId,
        { response: 'Error', status: CommandExecutionStatus.Fail, error },
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandErrorReceived,
        error,
        { databaseId: instanceId },
      );
    });
  });

  describe('sendCommandDeletedEvent', () => {
    it('should emit WorkbenchCommandDeleted event', () => {
      service.sendCommandDeletedEvent(
        instanceId,
        { command: 'info' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandDeleted,
        {
          databaseId: instanceId,
          command: 'info',
        },
      );
    });
    it('should emit WorkbenchCommandDeleted event without additional data', () => {
      service.sendCommandDeletedEvent(
        instanceId,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandDeleted,
        {
          databaseId: instanceId,
        },
      );
    });
  });
});
