import { Test, TestingModule } from '@nestjs/testing';
import {
  mockRedisMovedError,
  mockStandaloneDatabaseEntity,
  mockWorkbenchAnalyticsService,
} from 'src/__mocks__';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { ClusterNodeRole, CreateCommandExecutionDto } from 'src/modules/workbench/dto/create-command-execution.dto';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { BadRequestException, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import {
  CommandNotSupportedError,
  ClusterNodeNotFoundError,
  WrongDatabaseTypeError,
} from 'src/modules/cli/constants/errors';
import { ICliExecResultFromNode, RedisToolService } from 'src/modules/shared/services/base/redis-tool.service';
import { WorkbenchAnalyticsService } from '../services/workbench-analytics/workbench-analytics.service';

const MOCK_ERROR_MESSAGE = 'Some error';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

const mockCliTool = () => ({
  execCommand: jest.fn(),
  execCommandForNodes: jest.fn(),
  execCommandForNode: jest.fn(),
});

const mockNodeEndpoint = {
  host: '127.0.0.1',
  port: 6379,
};

const mockCliNodeResponse: ICliExecResultFromNode = {
  ...mockNodeEndpoint,
  response: 'OK',
  status: CommandExecutionStatus.Success,
};

const mockCreateCommandExecutionDto: CreateCommandExecutionDto = {
  command: 'set foo bar',
  nodeOptions: {
    ...mockNodeEndpoint,
    enableRedirection: true,
  },
  role: ClusterNodeRole.All,
};

const mockCommandExecutionResult: CommandExecutionResult = {
  status: mockCliNodeResponse.status,
  response: mockCliNodeResponse.response,
  node: {
    ...mockNodeEndpoint,
  },
};

describe('WorkbenchCommandsExecutor', () => {
  let service: WorkbenchCommandsExecutor;
  let cliTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbenchCommandsExecutor,
        {
          provide: RedisToolService,
          useFactory: mockCliTool,
        },
        {
          provide: WorkbenchAnalyticsService,
          useFactory: mockWorkbenchAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<WorkbenchCommandsExecutor>(WorkbenchCommandsExecutor);
    cliTool = module.get<RedisToolService>(RedisToolService);
  });

  describe('sendCommand', () => {
    describe('sendCommandForStandalone', () => {
      it('should successfully send command for standalone', async () => {
        cliTool.execCommand.mockResolvedValueOnce(mockCommandExecutionResult.response);

        const result = await service.sendCommand(mockClientOptions, {
          command: mockCreateCommandExecutionDto.command,
        });

        expect(result).toEqual([{
          response: mockCommandExecutionResult.response,
          status: mockCommandExecutionResult.status,
        }]);
      });
      it('should return fail status in case of unsupported command error', async () => {
        cliTool.execCommand.mockRejectedValueOnce(new CommandNotSupportedError(MOCK_ERROR_MESSAGE));

        const result = await service.sendCommand(mockClientOptions, {
          command: mockCreateCommandExecutionDto.command,
        });

        expect(result).toEqual([{
          response: MOCK_ERROR_MESSAGE,
          status: CommandExecutionStatus.Fail,
        }]);
      });
      it('should return fail status when replyError happened', async () => {
        const replyError: Error = {
          message: MOCK_ERROR_MESSAGE,
          name: 'ReplyError',
        };

        cliTool.execCommand.mockRejectedValueOnce(replyError);

        const result = await service.sendCommand(mockClientOptions, {
          command: mockCreateCommandExecutionDto.command,
        });

        expect(result).toEqual([{
          response: MOCK_ERROR_MESSAGE,
          status: CommandExecutionStatus.Fail,
        }]);
      });
      it('should throw an error when unexpected error happened', async () => {
        cliTool.execCommand.mockRejectedValueOnce(new ServiceUnavailableException(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockClientOptions, {
            command: mockCreateCommandExecutionDto.command,
          });
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(InternalServerErrorException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);
        }
      });
    });
    describe('sendCommandForSingleNode', () => {
      it('should successfully send command for standalone', async () => {
        cliTool.execCommandForNode.mockResolvedValueOnce(mockCliNodeResponse);

        const result = await service.sendCommand(mockClientOptions, mockCreateCommandExecutionDto);

        expect(result).toEqual([{
          ...mockCommandExecutionResult,
        }]);
      });
      it('should return failed status when redirection disabled and MOVED response received', async () => {
        cliTool.execCommandForNode.mockResolvedValueOnce({
          ...mockCliNodeResponse,
          error: mockRedisMovedError,
        });

        const result = await service.sendCommand(mockClientOptions, {
          ...mockCreateCommandExecutionDto,
          nodeOptions: {
            ...mockCreateCommandExecutionDto.nodeOptions,
            enableRedirection: false,
          },
        });

        expect(result).toEqual([{
          ...mockCommandExecutionResult,
        }]);
      });
      it('should return success status when redirection enabled and MOVED response received', async () => {
        cliTool.execCommandForNode.mockResolvedValueOnce({
          ...mockCliNodeResponse,
          error: mockRedisMovedError,
        });
        cliTool.execCommandForNode.mockResolvedValueOnce(mockCliNodeResponse);

        const result = await service.sendCommand(mockClientOptions, mockCreateCommandExecutionDto);

        expect(result).toEqual([{
          ...mockCommandExecutionResult,
          node: {
            ...mockCommandExecutionResult.node,
            slot: 7008,
          },
        }]);
      });
      it('should return fail status when command is not supported', async () => {
        cliTool.execCommandForNode.mockRejectedValueOnce(new CommandNotSupportedError(MOCK_ERROR_MESSAGE));

        const result = await service.sendCommand(mockClientOptions, mockCreateCommandExecutionDto);

        expect(result).toEqual([{
          response: MOCK_ERROR_MESSAGE,
          status: CommandExecutionStatus.Fail,
        }]);
      });
      it('should throw BadRequest when ClusterNodeNotFoundError error received', async () => {
        cliTool.execCommandForNode.mockRejectedValueOnce(new ClusterNodeNotFoundError(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockClientOptions, mockCreateCommandExecutionDto);
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);
        }
      });
      it('should throw an error when unexpected error happened', async () => {
        cliTool.execCommandForNode.mockRejectedValueOnce(new ServiceUnavailableException(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockClientOptions, mockCreateCommandExecutionDto);
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(InternalServerErrorException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);
        }
      });
    });
    describe('sendCommandForNodes', () => {
      it('should successfully send commands for nodes by role', async () => {
        cliTool.execCommandForNodes.mockResolvedValueOnce([
          mockCliNodeResponse,
          {
            ...mockCliNodeResponse,
            status: CommandExecutionStatus.Fail,
          },
        ]);

        const result = await service.sendCommand(mockClientOptions, {
          command: mockCreateCommandExecutionDto.command,
          role: mockCreateCommandExecutionDto.role,
        });

        expect(result).toEqual([
          mockCommandExecutionResult,
          {
            ...mockCommandExecutionResult,
            status: CommandExecutionStatus.Fail,
          },
        ]);
      });
      it('should return fail status when command is not supported', async () => {
        cliTool.execCommandForNodes.mockRejectedValueOnce(new CommandNotSupportedError(MOCK_ERROR_MESSAGE));

        const result = await service.sendCommand(mockClientOptions, {
          command: mockCreateCommandExecutionDto.command,
          role: mockCreateCommandExecutionDto.role,
        });

        expect(result).toEqual([{
          response: MOCK_ERROR_MESSAGE,
          status: CommandExecutionStatus.Fail,
        }]);
      });
      it('should throw BadRequest when WrongDatabaseTypeError error received', async () => {
        cliTool.execCommandForNodes.mockRejectedValueOnce(new WrongDatabaseTypeError(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockClientOptions, {
            command: mockCreateCommandExecutionDto.command,
            role: mockCreateCommandExecutionDto.role,
          });
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);
        }
      });
      it('should throw an error when unexpected error happened', async () => {
        cliTool.execCommandForNodes.mockRejectedValueOnce(new ServiceUnavailableException(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockClientOptions, {
            command: mockCreateCommandExecutionDto.command,
            role: mockCreateCommandExecutionDto.role,
          });
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(InternalServerErrorException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);
        }
      });
    });
  });
});
