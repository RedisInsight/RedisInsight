import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockRedisWrongTypeError, mockDatabase, MockType } from 'src/__mocks__';
import { CommandType, TelemetryEvents } from 'src/constants';
import { ReplyError } from 'src/models';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { CommandParsingError } from 'src/modules/cli/constants/errors';
import { CommandsService } from 'src/modules/commands/commands.service';
import { WorkbenchAnalyticsService } from './workbench-analytics.service';

const redisReplyError: ReplyError = {
  ...mockRedisWrongTypeError,
  command: { name: 'sadd' },
};
const instanceId = mockDatabase.id;

const mockCommandsService = {
  getCommandsGroups: jest.fn(),
};

describe('WorkbenchAnalyticsService', () => {
  let service: WorkbenchAnalyticsService;
  let sendEventMethod: jest.SpyInstance<WorkbenchAnalyticsService, unknown[]>;
  let sendFailedEventMethod: jest.SpyInstance<WorkbenchAnalyticsService, unknown[]>;
  let commandsService: MockType<CommandsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        {
          provide: CommandsService,
          useFactory: () => mockCommandsService,
        },
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

    commandsService = module.get(CommandsService);
    commandsService.getCommandsGroups.mockResolvedValue({
      main: {
        SET: {
          summary: 'Set the string value of a key',
          since: '1.0.0',
          group: 'string',
          complexity: 'O(1)',
          acl_categories: [
            '@write',
            '@string',
            '@slow',
          ],
        },
      },
      redisbloom: {
        'BF.RESERVE': {
          summary: 'Creates a new Bloom Filter',
          complexity: 'O(1)',
          since: '1.0.0',
          group: 'bf',
        },
      },
      custommodule: {
        'CUSTOM.COMMAND': {
          summary: 'Creates a new Bloom Filter',
          complexity: 'O(1)',
          since: '1.0.0',
        },
      },
    });
  });

  describe('sendIndexInfoEvent', () => {
    it('should emit index info event', async () => {
      service.sendIndexInfoEvent(
        instanceId,
        {
          any: 'fields',
        },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchIndexInfoSubmitted,
        {
          databaseId: instanceId,
          any: 'fields',
        },
      );
    });
    it('should not fail and should not emit when no data to send', async () => {
      service.sendIndexInfoEvent(
        instanceId,
        null,
      );

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });
  describe('sendCommandExecutedEvents', () => {
    it('should emit multiple events', async () => {
      await service.sendCommandExecutedEvents(
        instanceId,
        [
          { response: 'OK', status: CommandExecutionStatus.Success },
          { response: 'OK', status: CommandExecutionStatus.Success },
        ],
        { command: 'set' },
      );

      expect(sendEventMethod).toHaveBeenCalledTimes(2);
      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'set',
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
  });
  describe('sendCommandExecutedEvent', () => {
    it('should emit WorkbenchCommandExecuted event', async () => {
      await service.sendCommandExecutedEvent(
        instanceId,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'set' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'set',
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
    it('should emit event if failed to fetch commands groups', async () => {
      commandsService.getCommandsGroups.mockRejectedValue(new Error('some error'));

      await service.sendCommandExecutedEvent(
        instanceId,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'set' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'set',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event (module with cap.)', async () => {
      await service.sendCommandExecutedEvent(
        instanceId,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'bF.rEsErvE' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'bF.rEsErvE',
          commandType: CommandType.Module,
          moduleName: 'redisbloom',
          capability: 'bf',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event (module w\\o cap.)', async () => {
      await service.sendCommandExecutedEvent(
        instanceId,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'CUSTOM.COMMAnd' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'CUSTOM.COMMAnd',
          commandType: CommandType.Module,
          moduleName: 'custommodule',
          capability: 'n/a',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event (custom module)', async () => {
      await service.sendCommandExecutedEvent(
        instanceId,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'some.command' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'some.command',
          commandType: CommandType.Module,
          moduleName: 'custom',
          capability: 'n/a',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event without additional data', async () => {
      await service.sendCommandExecutedEvent(
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
    it('should emit WorkbenchCommandError event', async () => {
      await service.sendCommandExecutedEvent(
        instanceId,
        { response: 'Error', error: redisReplyError, status: CommandExecutionStatus.Fail },
        { command: 'set', data: 'Some data' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.WorkbenchCommandErrorReceived,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'set',
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
          data: 'Some data',
        },
      );
    });
    it('should emit WorkbenchCommandError event without additional data', async () => {
      await service.sendCommandExecutedEvent(
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
    it('should emit WorkbenchCommandError event for custom error', async () => {
      const error: any = CommandParsingError;
      await service.sendCommandExecutedEvent(
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
    it('should emit WorkbenchCommandError event for HttpException', async () => {
      const error = new ServiceUnavailableException();
      await service.sendCommandExecutedEvent(
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
