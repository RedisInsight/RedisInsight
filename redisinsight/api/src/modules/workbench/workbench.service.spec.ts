import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { mockStandaloneDatabaseEntity, mockWorkbenchAnalyticsService } from 'src/__mocks__';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { WorkbenchService } from 'src/modules/workbench/workbench.service';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CommandExecutionProvider } from 'src/modules/workbench/providers/command-execution.provider';
import {
  ClusterNodeRole,
  CreateCommandExecutionDto,
  WorkbenchMode,
} from 'src/modules/workbench/dto/create-command-execution.dto';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { WorkbenchAnalyticsService } from './services/workbench-analytics/workbench-analytics.service';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

const mockCreateCommandExecutionDto: CreateCommandExecutionDto = {
  command: 'set foo bar',
  nodeOptions: {
    host: '127.0.0.1',
    port: 7002,
    enableRedirection: true,
  },
  role: ClusterNodeRole.All,
  mode: WorkbenchMode.ASCII,
};

const mockCommandExecutionResults: CommandExecutionResult[] = [
  new CommandExecutionResult({
    status: CommandExecutionStatus.Success,
    response: 'OK',
    node: {
      host: '127.0.0.1',
      port: 6379,
      slot: 0,
    },
  }),
];
const mockCommandExecution: CommandExecution = new CommandExecution({
  ...mockCreateCommandExecutionDto,
  databaseId: mockStandaloneDatabaseEntity.id,
  id: uuidv4(),
  createdAt: new Date(),
  result: mockCommandExecutionResults,
});

const mockCommandExecutionProvider = () => ({
  create: jest.fn(),
  getList: jest.fn(),
  getOne: jest.fn(),
  delete: jest.fn(),
});

describe('WorkbenchService', () => {
  let service: WorkbenchService;
  let workbenchCommandsExecutor;
  let commandExecutionProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbenchService,
        {
          provide: WorkbenchAnalyticsService,
          useFactory: mockWorkbenchAnalyticsService,
        },
        {
          provide: WorkbenchCommandsExecutor,
          useFactory: () => ({
            sendCommand: jest.fn(),
          }),
        },
        {
          provide: CommandExecutionProvider,
          useFactory: mockCommandExecutionProvider,
        },
      ],
    }).compile();

    service = module.get<WorkbenchService>(WorkbenchService);
    workbenchCommandsExecutor = module.get<WorkbenchCommandsExecutor>(WorkbenchCommandsExecutor);
    commandExecutionProvider = module.get<CommandExecutionProvider>(CommandExecutionProvider);
  });

  describe('createCommandExecution', () => {
    it('should successfully execute command and save it', async () => {
      workbenchCommandsExecutor.sendCommand.mockResolvedValueOnce(mockCommandExecutionResults);
      commandExecutionProvider.create.mockResolvedValueOnce(mockCommandExecution);

      const result = await service.createCommandExecution(mockClientOptions, mockCreateCommandExecutionDto);

      expect(result).toBeInstanceOf(CommandExecution);
      expect(result).toEqual(mockCommandExecution);
    });
    it('should save result as unsupported command message', async () => {
      workbenchCommandsExecutor.sendCommand.mockResolvedValueOnce(mockCommandExecutionResults);

      const dto = {
        ...mockCommandExecutionResults,
        command: 'subscribe',
        mode: WorkbenchMode.ASCII,
      };

      await service.createCommandExecution(mockClientOptions, dto);

      expect(commandExecutionProvider.create).toHaveBeenCalledWith({
        ...dto,
        databaseId: mockClientOptions.instanceId,
        result: [
          {
            response: ERROR_MESSAGES.WORKBENCH_COMMAND_NOT_SUPPORTED(dto.command.toUpperCase()),
            status: CommandExecutionStatus.Fail,
          },
        ],
      });
    });
    it('should throw an error when command execution failed', async () => {
      workbenchCommandsExecutor.sendCommand.mockRejectedValueOnce(new BadRequestException('error'));

      const dto = {
        ...mockCommandExecutionResults,
        command: 'scan 0',
        mode: WorkbenchMode.ASCII,
      };

      try {
        await service.createCommandExecution(mockClientOptions, dto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
    it('should throw an error from command execution provider (create)', async () => {
      workbenchCommandsExecutor.sendCommand.mockResolvedValueOnce(mockCommandExecutionResults);
      commandExecutionProvider.create.mockRejectedValueOnce(new InternalServerErrorException('db error'));

      const dto = {
        ...mockCommandExecutionResults,
        command: 'scan 0',
        mode: WorkbenchMode.ASCII,
      };

      try {
        await service.createCommandExecution(mockClientOptions, dto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('listCommandExecutions', () => {
    it('should return list of command executions', async () => {
      commandExecutionProvider.getList.mockResolvedValueOnce([mockCommandExecution, mockCommandExecution]);

      const result = await service.listCommandExecutions(mockClientOptions.instanceId);

      expect(result).toEqual([mockCommandExecution, mockCommandExecution]);
    });
    it('should throw an error from command execution provider (getList)', async () => {
      commandExecutionProvider.getList.mockRejectedValueOnce(new InternalServerErrorException());

      try {
        await service.listCommandExecutions(mockClientOptions.instanceId);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
  describe('getCommandExecution', () => {
    it('should return full command executions', async () => {
      commandExecutionProvider.getOne.mockResolvedValueOnce(mockCommandExecution);

      const result = await service.getCommandExecution(mockClientOptions.instanceId, mockCommandExecution.id);

      expect(result).toEqual(mockCommandExecution);
    });
    it('should throw an error from command execution provider (getOne)', async () => {
      commandExecutionProvider.getOne.mockRejectedValueOnce(new InternalServerErrorException());

      try {
        await service.getCommandExecution(mockClientOptions.instanceId, mockCommandExecution.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
  describe('deleteCommandExecution', () => {
    it('should not return anything on delete', async () => {
      commandExecutionProvider.delete.mockResolvedValueOnce('some response');

      const result = await service.deleteCommandExecution(mockClientOptions.instanceId, mockCommandExecution.id);

      expect(result).toEqual(undefined);
    });
  });
});
