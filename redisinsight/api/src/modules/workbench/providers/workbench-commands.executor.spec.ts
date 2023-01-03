import { Test, TestingModule } from '@nestjs/testing';
import { get } from 'lodash';
import {
  mockRedisMovedError,
  mockWorkbenchAnalyticsService,
  mockWorkbenchClientMetadata,
} from 'src/__mocks__';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { unknownCommand } from 'src/constants';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import {
  ClusterNodeRole,
  CreateCommandExecutionDto,
  RunQueryMode,
} from 'src/modules/workbench/dto/create-command-execution.dto';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { BadRequestException, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import {
  CommandNotSupportedError,
  CommandParsingError,
  ClusterNodeNotFoundError,
  WrongDatabaseTypeError,
} from 'src/modules/cli/constants/errors';
import { ICliExecResultFromNode, RedisToolService } from 'src/modules/redis/redis-tool.service';
import { FormatterManager, IFormatterStrategy, FormatterTypes } from 'src/common/transformers';
import { WorkbenchAnalyticsService } from '../services/workbench-analytics/workbench-analytics.service';

const MOCK_ERROR_MESSAGE = 'Some error';

const mockCliTool = () => ({
  execCommand: jest.fn(),
  execCommandForNodes: jest.fn(),
  execCommandForNode: jest.fn(),
  formatterManager: jest.fn(),
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

const mockSetCommand = 'set';
const mockGetEscapedKeyCommand = 'get "\\\\key';
const mockCreateCommandExecutionDto: CreateCommandExecutionDto = {
  command: `${mockSetCommand} foo bar`,
  nodeOptions: {
    ...mockNodeEndpoint,
    enableRedirection: true,
  },
  role: ClusterNodeRole.All,
  mode: RunQueryMode.ASCII,
};

const mockCommandExecutionResult: CommandExecutionResult = {
  status: mockCliNodeResponse.status,
  response: mockCliNodeResponse.response,
  node: {
    ...mockNodeEndpoint,
  },
};

const mockAnalyticsService = mockWorkbenchAnalyticsService();

describe('WorkbenchCommandsExecutor', () => {
  let service: WorkbenchCommandsExecutor;
  let cliTool;
  let utf8Formatter: IFormatterStrategy;
  let asciiFormatter: IFormatterStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbenchCommandsExecutor,
        {
          provide: RedisToolService,
          useFactory: mockCliTool,
        },
        {
          provide: WorkbenchAnalyticsService,
          useFactory: () => mockAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<WorkbenchCommandsExecutor>(WorkbenchCommandsExecutor);
    cliTool = module.get<RedisToolService>(RedisToolService);

    const formatterManager: FormatterManager = get(
      service,
      'formatterManager',
    );
    utf8Formatter = formatterManager.getStrategy(
      FormatterTypes.UTF8,
    );
    asciiFormatter = formatterManager.getStrategy(
      FormatterTypes.ASCII,
    );
  });

  describe('sendCommand', () => {
    describe('sendCommandForStandalone', () => {
      it('should successfully send command for standalone', async () => {
        cliTool.execCommand.mockResolvedValueOnce(mockCommandExecutionResult.response);

        const result = await service.sendCommand(mockWorkbenchClientMetadata, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.ASCII,
        });

        expect(result).toEqual([{
          response: mockCommandExecutionResult.response,
          status: mockCommandExecutionResult.status,
        }]);

        expect(mockAnalyticsService.sendCommandExecutedEvents).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          [
            {
              response: mockCommandExecutionResult.response,
              status: CommandExecutionStatus.Success,
            },
          ],
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should return fail status in case of unsupported command error', async () => {
        cliTool.execCommand.mockRejectedValueOnce(new CommandNotSupportedError(MOCK_ERROR_MESSAGE));

        const result = await service.sendCommand(mockWorkbenchClientMetadata, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.ASCII,
        });

        expect(result).toEqual([{
          response: MOCK_ERROR_MESSAGE,
          status: CommandExecutionStatus.Fail,
        }]);

        expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          {
            response: MOCK_ERROR_MESSAGE,
            error: new CommandNotSupportedError(MOCK_ERROR_MESSAGE),
            status: CommandExecutionStatus.Fail,
          },
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should return fail status when replyError happened', async () => {
        const replyError: Error = {
          message: MOCK_ERROR_MESSAGE,
          name: 'ReplyError',
        };

        cliTool.execCommand.mockRejectedValueOnce(replyError);

        const result = await service.sendCommand(mockWorkbenchClientMetadata, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.ASCII,
        });

        expect(result).toEqual([{
          response: MOCK_ERROR_MESSAGE,
          status: CommandExecutionStatus.Fail,
        }]);

        expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          {
            response: MOCK_ERROR_MESSAGE,
            error: replyError,
            status: CommandExecutionStatus.Fail,
          },
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should successfully execute command and return ascii response', async () => {
        const formatSpy = jest.spyOn(asciiFormatter, 'format');

        cliTool.execCommand.mockResolvedValueOnce(mockCommandExecutionResult.response);

        const result = await service.sendCommand(mockWorkbenchClientMetadata, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.ASCII,
        });

        expect(result).toEqual([{
          response: mockCommandExecutionResult.response,
          status: mockCommandExecutionResult.status,
        }]);
        expect(formatSpy).toHaveBeenCalled();

        expect(mockAnalyticsService.sendCommandExecutedEvents).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          [
            {
              response: mockCommandExecutionResult.response,
              status: CommandExecutionStatus.Success,
            },
          ],
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should successfully execute command and return raw response', async () => {
        const formatSpy = jest.spyOn(utf8Formatter, 'format');

        cliTool.execCommand.mockResolvedValueOnce(mockCommandExecutionResult.response);

        const result = await service.sendCommand(mockWorkbenchClientMetadata, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.Raw,
        });

        expect(result).toEqual([{
          response: mockCommandExecutionResult.response,
          status: mockCommandExecutionResult.status,
        }]);
        expect(formatSpy).toHaveBeenCalled();

        expect(mockAnalyticsService.sendCommandExecutedEvents).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          [
            {
              response: mockCommandExecutionResult.response,
              status: CommandExecutionStatus.Success,
            },
          ],
          {
            command: mockSetCommand,
            rawMode: true,
          },
        );
      });
      it('should throw an error when on unexpected error', async () => {
        cliTool.execCommand.mockRejectedValueOnce(new ServiceUnavailableException(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockWorkbenchClientMetadata, {
            command: mockCreateCommandExecutionDto.command,
            mode: RunQueryMode.ASCII,
          });
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(InternalServerErrorException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);

          expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
            mockWorkbenchClientMetadata.databaseId,
            {
              response: MOCK_ERROR_MESSAGE,
              error: new ServiceUnavailableException(MOCK_ERROR_MESSAGE),
              status: CommandExecutionStatus.Fail,
            },
            {
              command: mockSetCommand,
              rawMode: false,
            },
          );
        }
      });
    });
    describe('sendCommandForSingleNode', () => {
      it('should successfully send command for standalone', async () => {
        cliTool.execCommandForNode.mockResolvedValueOnce(mockCliNodeResponse);

        const result = await service.sendCommand(mockWorkbenchClientMetadata, mockCreateCommandExecutionDto);

        expect(result).toEqual([{
          ...mockCommandExecutionResult,
        }]);

        expect(mockAnalyticsService.sendCommandExecutedEvents).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          [
            {
              ...mockCommandExecutionResult,
            },
          ],
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should return failed status when redirection disabled and MOVED response received', async () => {
        cliTool.execCommandForNode.mockResolvedValueOnce({
          ...mockCliNodeResponse,
          error: mockRedisMovedError,
        });

        const result = await service.sendCommand(mockWorkbenchClientMetadata, {
          ...mockCreateCommandExecutionDto,
          nodeOptions: {
            ...mockCreateCommandExecutionDto.nodeOptions,
            enableRedirection: false,
          },
        });

        expect(result).toEqual([{
          ...mockCommandExecutionResult,
        }]);

        expect(mockAnalyticsService.sendCommandExecutedEvents).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          [
            {
              ...mockCommandExecutionResult,
            },
          ],
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should return success status when redirection enabled and MOVED response received', async () => {
        cliTool.execCommandForNode.mockResolvedValueOnce({
          ...mockCliNodeResponse,
          error: mockRedisMovedError,
        });
        cliTool.execCommandForNode.mockResolvedValueOnce(mockCliNodeResponse);

        const result = await service.sendCommand(mockWorkbenchClientMetadata, mockCreateCommandExecutionDto);

        expect(result).toEqual([{
          ...mockCommandExecutionResult,
          node: {
            ...mockCommandExecutionResult.node,
            slot: 7008,
          },
        }]);

        expect(mockAnalyticsService.sendCommandExecutedEvents).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          [
            {
              ...mockCommandExecutionResult,
              node: {
                ...mockCommandExecutionResult.node,
                slot: 7008,
              },
            },
          ],
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should return fail status when command is not supported', async () => {
        cliTool.execCommandForNode.mockRejectedValueOnce(new CommandNotSupportedError(MOCK_ERROR_MESSAGE));

        const result = await service.sendCommand(mockWorkbenchClientMetadata, mockCreateCommandExecutionDto);

        expect(result).toEqual([{
          response: MOCK_ERROR_MESSAGE,
          status: CommandExecutionStatus.Fail,
        }]);

        expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          {
            response: MOCK_ERROR_MESSAGE,
            error: new CommandNotSupportedError(MOCK_ERROR_MESSAGE),
            status: CommandExecutionStatus.Fail,
          },
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should throw BadRequest when ClusterNodeNotFoundError error received', async () => {
        cliTool.execCommandForNode.mockRejectedValueOnce(new ClusterNodeNotFoundError(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockWorkbenchClientMetadata, mockCreateCommandExecutionDto);
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);

          expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
            mockWorkbenchClientMetadata.databaseId,
            {
              response: MOCK_ERROR_MESSAGE,
              error: new ClusterNodeNotFoundError(MOCK_ERROR_MESSAGE),
              status: CommandExecutionStatus.Fail,
            },
            {
              command: mockSetCommand,
              rawMode: false,
            },
          );
        }
      });
      it('should throw an error when unexpected error happened', async () => {
        cliTool.execCommandForNode.mockRejectedValueOnce(new ServiceUnavailableException(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockWorkbenchClientMetadata, mockCreateCommandExecutionDto);
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(InternalServerErrorException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);

          expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
            mockWorkbenchClientMetadata.databaseId,
            {
              response: MOCK_ERROR_MESSAGE,
              error: new ServiceUnavailableException(MOCK_ERROR_MESSAGE),
              status: CommandExecutionStatus.Fail,
            },
            {
              command: mockSetCommand,
              rawMode: false,
            },
          );
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

        const result = await service.sendCommand(mockWorkbenchClientMetadata, {
          command: mockCreateCommandExecutionDto.command,
          role: mockCreateCommandExecutionDto.role,
          mode: RunQueryMode.ASCII,
        });

        expect(result).toEqual([
          mockCommandExecutionResult,
          {
            ...mockCommandExecutionResult,
            status: CommandExecutionStatus.Fail,
          },
        ]);

        expect(mockAnalyticsService.sendCommandExecutedEvents).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          [
            mockCommandExecutionResult,
            {
              ...mockCommandExecutionResult,
              status: CommandExecutionStatus.Fail,
            },
          ],
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should return fail status when command is not supported', async () => {
        cliTool.execCommandForNodes.mockRejectedValueOnce(new CommandNotSupportedError(MOCK_ERROR_MESSAGE));

        const result = await service.sendCommand(mockWorkbenchClientMetadata, {
          command: mockCreateCommandExecutionDto.command,
          role: mockCreateCommandExecutionDto.role,
          mode: RunQueryMode.ASCII,
        });

        expect(result).toEqual([{
          response: MOCK_ERROR_MESSAGE,
          status: CommandExecutionStatus.Fail,
        }]);

        expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          {
            response: MOCK_ERROR_MESSAGE,
            error: new CommandNotSupportedError(MOCK_ERROR_MESSAGE),
            status: CommandExecutionStatus.Fail,
          },
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should throw BadRequest when WrongDatabaseTypeError error received', async () => {
        cliTool.execCommandForNodes.mockRejectedValueOnce(new WrongDatabaseTypeError(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockWorkbenchClientMetadata, {
            command: mockCreateCommandExecutionDto.command,
            role: mockCreateCommandExecutionDto.role,
            mode: RunQueryMode.ASCII,
          });
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);

          expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
            mockWorkbenchClientMetadata.databaseId,
            {
              response: MOCK_ERROR_MESSAGE,
              error: new WrongDatabaseTypeError(MOCK_ERROR_MESSAGE),
              status: CommandExecutionStatus.Fail,
            },
            {
              command: mockSetCommand,
              rawMode: false,
            },
          );
        }
      });
      it('should throw an error when unexpected error happened', async () => {
        cliTool.execCommandForNodes.mockRejectedValueOnce(new ServiceUnavailableException(MOCK_ERROR_MESSAGE));

        try {
          await service.sendCommand(mockWorkbenchClientMetadata, {
            command: mockCreateCommandExecutionDto.command,
            role: mockCreateCommandExecutionDto.role,
            mode: RunQueryMode.ASCII,
          });
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(InternalServerErrorException);
          expect(e.message).toEqual(MOCK_ERROR_MESSAGE);

          expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
            mockWorkbenchClientMetadata.databaseId,
            {
              response: MOCK_ERROR_MESSAGE,
              error: new ServiceUnavailableException(MOCK_ERROR_MESSAGE),
              status: CommandExecutionStatus.Fail,
            },
            {
              command: mockSetCommand,
              rawMode: false,
            },
          );
        }
      });
    });
    describe('CommandParsingError', () => {
      it('should return response with [CLI_UNTERMINATED_QUOTES] error for sendCommandForNodes', async () => {
        const mockResult = [
          {
            response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
            status: CommandExecutionStatus.Fail,
          },
        ];

        const result = await service.sendCommand(mockWorkbenchClientMetadata, {
          command: mockGetEscapedKeyCommand,
          role: mockCreateCommandExecutionDto.role,
          mode: RunQueryMode.ASCII,
        });

        expect(result).toEqual(mockResult);
        expect(mockAnalyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
          mockWorkbenchClientMetadata.databaseId,
          {
            response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
            error: new CommandParsingError(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES()),
            status: CommandExecutionStatus.Fail,
          },
          {
            command: unknownCommand,
            rawMode: false,
          },
        );
      });
    });
  });
});
