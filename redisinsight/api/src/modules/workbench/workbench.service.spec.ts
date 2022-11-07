import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { when } from 'jest-when';
import { mockStandaloneDatabaseEntity, mockWorkbenchAnalyticsService } from 'src/__mocks__';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { WorkbenchService } from 'src/modules/workbench/workbench.service';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CommandExecutionProvider } from 'src/modules/workbench/providers/command-execution.provider';
import {
  ClusterNodeRole,
  CreateCommandExecutionDto,
  RunQueryMode,
  ResultsMode,
} from 'src/modules/workbench/dto/create-command-execution.dto';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CreateCommandExecutionsDto } from 'src/modules/workbench/dto/create-command-executions.dto';
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
  mode: RunQueryMode.ASCII,
  resultsMode: ResultsMode.Default,
};

const mockCommands = ["set 1 1", "get 1"];

const mockCreateCommandExecutionDtoWithGroupMode: CreateCommandExecutionsDto = {
  commands: mockCommands,
  nodeOptions: {
    host: '127.0.0.1',
    port: 7002,
    enableRedirection: true,
  },
  role: ClusterNodeRole.All,
  mode: RunQueryMode.ASCII,
  resultsMode: ResultsMode.GroupMode,
};

const mockCreateCommandExecutionsDto: CreateCommandExecutionsDto = {
  commands: [
    mockCreateCommandExecutionDto.command,
    mockCreateCommandExecutionDto.command,
  ],
  ...mockCreateCommandExecutionDto,
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
const mockCommandExecutionToRun: CommandExecution = new CommandExecution({
  ...mockCreateCommandExecutionDto,
  databaseId: mockStandaloneDatabaseEntity.id,
});

const mockCommandExecution: CommandExecution = new CommandExecution({
  ...mockCommandExecutionToRun,
  id: uuidv4(),
  createdAt: new Date(),
  result: mockCommandExecutionResults,
});

const mockSendCommandResultSuccess = { response: "1", status: "success" };
const mockSendCommandResultFail = { response: "error", status: "fail" };

const mockCommandExecutionWithGroupMode = {
  mode: "ASCII",
  commands: mockCommands,
  resultsMode: "GROUP_MODE",
  databaseId: "d05043d0 - 0d12- 4ce1-9ca3 - 30c6d7e391ea",
  summary: { "total": 2, "success": 1, "fail": 1 },
  command: "set 1 1\r\nget 1",
  result: [{
    "status": "success", "response": [{ "response": "OK", "status": "success", "command": "set 1 1" }, { "response": "error", "status": "fail", "command": "get 1" }]
  }]
}

const mockCommandExecutionProvider = () => ({
  createMany: jest.fn(),
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
      const result = await service.createCommandExecution(mockClientOptions, mockCreateCommandExecutionDto);
      // can't predict execution time
      expect(result).toMatchObject(mockCommandExecutionToRun);
      expect(result.executionTime).toBeGreaterThan(0);
    });
    it('should save result as unsupported command message', async () => {
      workbenchCommandsExecutor.sendCommand.mockResolvedValueOnce(mockCommandExecutionResults);

      const dto = {
        ...mockCommandExecutionResults,
        command: 'subscribe',
        mode: RunQueryMode.ASCII,
      };

      expect(await service.createCommandExecution(mockClientOptions, dto)).toEqual({
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
        mode: RunQueryMode.ASCII,
      };

      try {
        await service.createCommandExecution(mockClientOptions, dto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('createCommandExecutions', () => {
    it('should successfully execute commands and save them', async () => {
      workbenchCommandsExecutor.sendCommand.mockResolvedValueOnce(
        [mockCommandExecutionResults, mockCommandExecutionResults],
      );
      commandExecutionProvider.createMany.mockResolvedValueOnce([mockCommandExecution, mockCommandExecution]);

      const result = await service.createCommandExecutions(mockClientOptions, mockCreateCommandExecutionsDto);

      expect(result).toEqual([mockCommandExecution, mockCommandExecution]);
    });

    it('should successfully execute commands and save in group mode view', async () => {
      when(workbenchCommandsExecutor.sendCommand)
        .calledWith(mockClientOptions, expect.anything())
        .mockResolvedValue([mockSendCommandResultSuccess]);

      commandExecutionProvider.createMany.mockResolvedValueOnce([mockCommandExecutionWithGroupMode]);

      const result = await service.createCommandExecutions(
        mockClientOptions,
        mockCreateCommandExecutionDtoWithGroupMode,
      );

      expect(result).toEqual([mockCommandExecutionWithGroupMode]);
    });

    it('should successfully execute commands with error and save summary', async () => {
      when(workbenchCommandsExecutor.sendCommand)
        .calledWith(mockClientOptions, {...mockCreateCommandExecutionDtoWithGroupMode, command: mockCommands[0]})
        .mockResolvedValue([mockSendCommandResultSuccess]);
      
      when(workbenchCommandsExecutor.sendCommand)
        .calledWith(mockClientOptions, {...mockCreateCommandExecutionDtoWithGroupMode, command: mockCommands[1]})
        .mockResolvedValue([mockSendCommandResultFail]);

      commandExecutionProvider.createMany.mockResolvedValueOnce([mockCommandExecutionWithGroupMode]);

      const result = await service.createCommandExecutions(
        mockClientOptions,
        mockCreateCommandExecutionDtoWithGroupMode,
      );

      expect(result).toEqual([mockCommandExecutionWithGroupMode]);
    });

    it('should throw an error when command execution failed', async () => {
      workbenchCommandsExecutor.sendCommand.mockRejectedValueOnce(new BadRequestException('error'));

      try {
        await service.createCommandExecutions(mockClientOptions, mockCreateCommandExecutionsDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
    it('should throw an error from command execution provider (create)', async () => {
      workbenchCommandsExecutor.sendCommand.mockResolvedValueOnce([mockCommandExecutionResults]);
      commandExecutionProvider.createMany.mockRejectedValueOnce(new InternalServerErrorException('db error'));

      try {
        await service.createCommandExecutions(mockClientOptions, mockCreateCommandExecutionsDto);
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
