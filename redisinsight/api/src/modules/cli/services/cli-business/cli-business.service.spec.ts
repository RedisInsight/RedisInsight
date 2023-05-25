import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { get } from 'lodash';

import { when } from 'jest-when';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  mockRedisServerInfoResponse,
  mockRedisWrongTypeError,
  mockCliAnalyticsService,
  mockRedisMovedError, MockType,
  mockDatabaseRecommendationService,
  mockCliClientMetadata,
} from 'src/__mocks__';
import {
  ClusterNodeRole,
  CommandExecutionStatus,
  SendClusterCommandDto,
  SendClusterCommandResponse,
  SendCommandDto,
  SendCommandResponse,
} from 'src/modules/cli/dto/cli.dto';
import { ReplyError } from 'src/models';
import { CliToolUnsupportedCommands } from 'src/modules/cli/utils/getUnsupportedCommands';
import {
  ClusterNodeNotFoundError,
  CommandNotSupportedError,
  CommandParsingError,
  WrongDatabaseTypeError,
} from 'src/modules/cli/constants/errors';
import { RECOMMENDATION_NAMES, unknownCommand } from 'src/constants';
import { CliAnalyticsService } from 'src/modules/cli/services/cli-analytics/cli-analytics.service';
import { KeytarUnavailableException } from 'src/modules/encryption/exceptions';
import { RedisToolService } from 'src/modules/redis/redis-tool.service';
import { CommandsService } from 'src/modules/commands/commands.service';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { OutputFormatterManager } from './output-formatter/output-formatter-manager';
import { CliOutputFormatterTypes, IOutputFormatterStrategy } from './output-formatter/output-formatter.interface';
import { CliBusinessService } from './cli-business.service';

const mockNode = {
  host: '127.0.0.1',
  port: 7002,
};

const mockRedisConsumer = () => ({
  execCommand: jest.fn(),
  execCommandForNode: jest.fn(),
  execCommandForNodes: jest.fn(),
  execPipeline: jest.fn(),
  createNewToolClient: jest.fn(),
  reCreateToolClient: jest.fn(),
  deleteToolClient: jest.fn(),
  getRedisClientNamespace: jest.fn(),
});

const mockCommandsService = () => ({
  getCommandsGroups: jest.fn(),
});

const mockENotFoundMessage = 'ENOTFOUND some message';
const mockMemoryUsageCommand = 'memory usage key';
const mockGetEscapedKeyCommand = 'get "\\\\key';
const mockServerInfoCommand = 'info server';
const mockIntegerResponse = 5;

describe('CliBusinessService', () => {
  let service: CliBusinessService;
  let cliTool;
  let recommendationService;
  let textFormatter: IOutputFormatterStrategy;
  let rawFormatter: IOutputFormatterStrategy;
  let analyticsService: MockType<CliAnalyticsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CliBusinessService,
        {
          provide: CliAnalyticsService,
          useFactory: mockCliAnalyticsService,
        },
        {
          provide: RedisToolService,
          useFactory: mockRedisConsumer,
        },
        {
          provide: CommandsService,
          useFactory: mockCommandsService,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
      ],
    }).compile();

    service = module.get<CliBusinessService>(CliBusinessService);
    cliTool = module.get<RedisToolService>(RedisToolService);
    analyticsService = module.get(CliAnalyticsService);
    recommendationService = module.get<DatabaseRecommendationService>(DatabaseRecommendationService);
    const outputFormatterManager: OutputFormatterManager = get(
      service,
      'outputFormatterManager',
    );
    textFormatter = outputFormatterManager.getStrategy(
      CliOutputFormatterTypes.Text,
    );
    rawFormatter = outputFormatterManager.getStrategy(
      CliOutputFormatterTypes.Raw,
    );
  });

  describe('getClient', () => {
    it('should successfully create new redis client', async () => {
      cliTool.createNewToolClient.mockResolvedValue(mockCliClientMetadata.uniqueId);

      const result = await service.getClient(mockCliClientMetadata);

      expect(result).toEqual({ uuid: mockCliClientMetadata.uniqueId });
      expect(analyticsService.sendClientCreatedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
      );
    });

    it('should throw internal exception on getClient error', async () => {
      cliTool.createNewToolClient.mockRejectedValue(
        new InternalServerErrorException(mockENotFoundMessage),
      );

      try {
        await service.getClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(analyticsService.sendClientCreationFailedEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new InternalServerErrorException(mockENotFoundMessage),
        );
      }
    });

    it('Should proxy EncryptionService errors on getClient', async () => {
      cliTool.createNewToolClient.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.getClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
        expect(analyticsService.sendClientCreationFailedEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new KeytarUnavailableException(),
        );
      }
    });
  });

  describe('reCreateClient', () => {
    it('should successfully create new redis client', async () => {
      cliTool.reCreateToolClient.mockResolvedValue(mockCliClientMetadata.uniqueId);

      const result = await service.reCreateClient(mockCliClientMetadata);

      expect(result).toEqual({ uuid: mockCliClientMetadata.uniqueId });
      expect(analyticsService.sendClientRecreatedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
      );
    });

    it('should throw internal exception on reCreateClient', async () => {
      cliTool.reCreateToolClient.mockRejectedValue(
        new InternalServerErrorException(mockENotFoundMessage),
      );

      try {
        await service.reCreateClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(analyticsService.sendClientCreationFailedEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new InternalServerErrorException(mockENotFoundMessage),
        );
      }
    });

    it('Should proxy EncryptionService errors on reCreateClient', async () => {
      cliTool.reCreateToolClient.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.reCreateClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
        expect(analyticsService.sendClientCreationFailedEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new KeytarUnavailableException(),
        );
      }
    });
  });

  describe('deleteClient', () => {
    it('should successfully close redis client', async () => {
      cliTool.deleteToolClient.mockResolvedValue(1);

      const result = await service.deleteClient(mockCliClientMetadata);

      expect(result).toEqual({ affected: 1 });
      expect(analyticsService.sendClientDeletedEvent).toHaveBeenCalledWith(
        1,
        mockCliClientMetadata.databaseId,
      );
    });

    it('should throw internal exception on deleteClient', async () => {
      cliTool.deleteToolClient.mockRejectedValue(new Error(mockENotFoundMessage));

      try {
        await service.deleteClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(analyticsService.sendClientDeletedEvent).not.toHaveBeenCalled();
      }
    });
  });

  describe('sendCommand', () => {
    it('should successfully execute command (RAW format)', async () => {
      const dto: SendCommandDto = { command: mockMemoryUsageCommand };
      const formatSpy = jest.spyOn(rawFormatter, 'format');
      const mockResult: SendCommandResponse = {
        response: mockIntegerResponse,
        status: CommandExecutionStatus.Success,
      };
      when(cliTool.execCommand)
        .calledWith(mockCliClientMetadata, 'memory', ['usage', 'key'], undefined)
        .mockReturnValue(5);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(formatSpy).toHaveBeenCalled();
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          command: 'memory',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });
    it('should successfully execute command and return raw response', async () => {
      const dto: SendCommandDto = {
        command: mockMemoryUsageCommand,
        outputFormat: CliOutputFormatterTypes.Raw,
      };
      const formatSpy = jest.spyOn(rawFormatter, 'format');
      const mockResult: SendCommandResponse = {
        response: 5,
        status: CommandExecutionStatus.Success,
      };
      when(cliTool.execCommand)
        .calledWith(mockCliClientMetadata, 'memory', ['usage', 'key'], undefined)
        .mockReturnValue(5);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(formatSpy).toHaveBeenCalled();
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          command: 'memory',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });
    it('should return response with [CLI_COMMAND_NOT_SUPPORTED] error for sendCommand', async () => {
      const command = CliToolUnsupportedCommands.ScriptDebug;
      const dto: SendCommandDto = { command };
      const mockResult: SendCommandResponse = {
        response: ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
          command.toUpperCase(),
        ),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        new CommandNotSupportedError(
          ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(command.toUpperCase()),
        ),
        {
          command: 'script',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with [CLI_UNTERMINATED_QUOTES] error for sendCommand', async () => {
      const command = mockGetEscapedKeyCommand;
      const dto: SendCommandDto = { command };
      const mockResult: SendCommandResponse = {
        response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        new CommandParsingError(
          ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
        ),
        {
          command: unknownCommand,
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with redis reply error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        name: 'ReplyError',
        command: 'GET',
      };
      cliTool.execCommand.mockRejectedValue(replyError);
      const dto: SendCommandDto = { command: 'get hashKey' };
      const mockResult: SendCommandResponse = {
        response: replyError.message,
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        replyError,
        {
          command: 'get',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should throw internal exception for sendCommand', async () => {
      const dto: SendCommandDto = { command: 'get key' };
      cliTool.execCommand.mockRejectedValue(new Error(mockENotFoundMessage));

      try {
        await service.sendCommand(mockCliClientMetadata, dto);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new Error(mockENotFoundMessage),
          {
            command: 'get',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });

    it('Should proxy EncryptionService errors for sendCommand', async () => {
      const dto: SendCommandDto = { command: 'get key' };
      cliTool.execCommand.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.sendCommand(mockCliClientMetadata, dto);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new KeytarUnavailableException(),
          {
            command: 'get',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });
    it('should return response in correct format for human-readable commands for sendCommand', async () => {
      const dto: SendCommandDto = { command: mockServerInfoCommand };
      const mockResult: SendCommandResponse = {
        response: mockRedisServerInfoResponse,
        status: CommandExecutionStatus.Success,
      };
      when(cliTool.execCommand)
        .calledWith(mockCliClientMetadata, 'info', ['server'], 'utf8')
        .mockReturnValue(mockRedisServerInfoResponse);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          command: 'info',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should call recommendationService', async () => {
      const dto: SendCommandDto = { command: mockMemoryUsageCommand };
      const [ command ] = dto.command.split(' ')

      await service.sendCommand(mockCliClientMetadata, dto);

      expect(recommendationService.check).toBeCalledWith(
        mockCliClientMetadata,
        RECOMMENDATION_NAMES.SEARCH_VISUALIZATION,
        command,
      );
      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });

  describe('sendClusterCommand', () => {
    beforeEach(async () => {
      service.sendCommandForSingleNode = jest.fn();
      service.sendCommandForNodes = jest.fn();
    });
    it('should call sendCommandForNodes method', async () => {
      const dto: SendClusterCommandDto = {
        command: mockMemoryUsageCommand,
        role: ClusterNodeRole.Master,
      };

      await service.sendClusterCommand(mockCliClientMetadata, dto);

      expect(service.sendCommandForNodes).toHaveBeenCalled();
    });
    it('should call sendCommandForSingleNode method', async () => {
      const dto: SendClusterCommandDto = {
        command: mockMemoryUsageCommand,
        role: ClusterNodeRole.All,
        nodeOptions: { ...mockNode, enableRedirection: true },
      };

      await service.sendClusterCommand(mockCliClientMetadata, dto);

      expect(service.sendCommandForSingleNode).toHaveBeenCalled();
    });

    it('Should proxy EncryptionService errors for sendClusterCommand', async () => {
      const dto: SendClusterCommandDto = {
        command: mockMemoryUsageCommand,
        role: ClusterNodeRole.All,
        nodeOptions: { ...mockNode, enableRedirection: true },
      };
      service.sendCommandForSingleNode = jest.fn().mockRejectedValue(new KeytarUnavailableException());

      await expect(service.sendClusterCommand(mockCliClientMetadata, dto)).rejects.toThrow(KeytarUnavailableException);
    });
  });

  describe('sendCommandForNodes', () => {
    it('should successfully execute command for masters', async () => {
      const command = mockMemoryUsageCommand;
      const mockResult: SendClusterCommandResponse[] = [
        {
          response: mockIntegerResponse,
          node: mockNode,
          status: CommandExecutionStatus.Success,
        },
      ];
      cliTool.execCommandForNodes.mockResolvedValue([
        { response: 5, ...mockNode, status: CommandExecutionStatus.Success },
      ]);

      const result = await service.sendCommandForNodes(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.Master,
      );

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendClusterCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          response: mockIntegerResponse,
          status: CommandExecutionStatus.Success,
          ...mockNode,
        },
        {
          command: 'memory',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response in correct format for human-readable commands for sendCommandForNodes', async () => {
      const mockResult: SendClusterCommandResponse[] = [
        {
          response: mockRedisServerInfoResponse,
          node: mockNode,
          status: CommandExecutionStatus.Success,
        },
      ];
      cliTool.execCommandForNodes.mockResolvedValue([
        {
          response: mockRedisServerInfoResponse,
          ...mockNode,
          status: CommandExecutionStatus.Success,
        },
      ]);

      const result = await service.sendCommandForNodes(
        mockCliClientMetadata,
        mockServerInfoCommand,
        ClusterNodeRole.Master,
      );

      expect(result).toEqual(mockResult);
      expect(cliTool.execCommandForNodes).toHaveBeenCalledWith(
        mockCliClientMetadata,
        'info',
        ['server'],
        ClusterNodeRole.Master,
        'utf8',
      );
      expect(analyticsService.sendClusterCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          response: mockRedisServerInfoResponse,
          status: CommandExecutionStatus.Success,
          ...mockNode,
        },
        {
          command: 'info',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with [CLI_COMMAND_NOT_SUPPORTED] error for sendCommandForNodes', async () => {
      const command = CliToolUnsupportedCommands.ScriptDebug;
      const mockResult: SendClusterCommandResponse[] = [
        {
          response: ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
            command.toUpperCase(),
          ),
          status: CommandExecutionStatus.Fail,
        },
      ];

      const result = await service.sendCommandForNodes(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.Master,
      );

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        new CommandNotSupportedError(ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
          command.toUpperCase(),
        )),
        {
          command: 'script',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with [CLI_UNTERMINATED_QUOTES] error for sendCommandForNodes', async () => {
      const command = mockGetEscapedKeyCommand;
      const mockResult: SendClusterCommandResponse[] = [
        {
          response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
          status: CommandExecutionStatus.Fail,
        },
      ];

      const result = await service.sendCommandForNodes(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.Master,
      );

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        new CommandParsingError(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES()),
        {
          command: unknownCommand,
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });
    it('should throw [WrongDatabaseTypeError]', async () => {
      const command = mockMemoryUsageCommand;
      cliTool.execCommandForNodes.mockRejectedValue(
        new WrongDatabaseTypeError(ERROR_MESSAGES.WRONG_DATABASE_TYPE),
      );

      try {
        await service.sendCommandForNodes(
          mockCliClientMetadata,
          command,
          ClusterNodeRole.Master,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(ERROR_MESSAGES.WRONG_DATABASE_TYPE);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new WrongDatabaseTypeError(ERROR_MESSAGES.WRONG_DATABASE_TYPE),
          {
            command: 'memory',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });
    it('should throw internal exception', async () => {
      const command = mockMemoryUsageCommand;
      cliTool.execCommandForNodes.mockRejectedValue(new Error(mockENotFoundMessage));

      try {
        await service.sendCommandForNodes(
          mockCliClientMetadata,
          command,
          ClusterNodeRole.Master,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new Error(mockENotFoundMessage),
          {
            command: 'memory',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });
    it('Should proxy EncryptionService errors', async () => {
      const command = mockMemoryUsageCommand;
      cliTool.execCommandForNodes.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.sendCommandForNodes(
          mockCliClientMetadata,
          command,
          ClusterNodeRole.Master,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new KeytarUnavailableException(),
          {
            command: 'memory',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });

    it('should call recommendationService', async () => {
      const commandInit = mockServerInfoCommand;
      const [ command ] = commandInit?.split(' ')

      cliTool.execCommandForNodes.mockResolvedValue([
        { response: 5, ...mockNode, status: CommandExecutionStatus.Success },
      ]);

      await service.sendCommandForNodes(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.Master,
      );

      expect(recommendationService.check).toBeCalledWith(
        mockCliClientMetadata,
        RECOMMENDATION_NAMES.SEARCH_VISUALIZATION,
        command,
      );

      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });

  describe('sendCommandForSingleNode', () => {
    const nodeOptions = { ...mockNode, enableRedirection: true };
    it('should successfully execute command for single', async () => {
      const command = mockMemoryUsageCommand;
      const mockResult: SendClusterCommandResponse = {
        response: mockIntegerResponse,
        node: mockNode,
        status: CommandExecutionStatus.Success,
      };
      cliTool.execCommandForNode.mockResolvedValue({
        response: 5,
        ...mockNode,
        status: CommandExecutionStatus.Success,
      });

      const result = await service.sendCommandForSingleNode(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.All,
        nodeOptions,
      );
      expect(result).toEqual(mockResult);
      expect(analyticsService.sendClusterCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          response: mockIntegerResponse,
          ...mockNode,
          status: CommandExecutionStatus.Success,
        },
        {
          command: 'memory',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return human-readable commands for sendCommandForSingleNode', async () => {
      const mockResult: SendClusterCommandResponse = {
        response: mockRedisServerInfoResponse,
        node: mockNode,
        status: CommandExecutionStatus.Success,
      };
      cliTool.execCommandForNode.mockResolvedValue({
        response: mockRedisServerInfoResponse,
        ...mockNode,
        status: CommandExecutionStatus.Success,
      });

      const result = await service.sendCommandForSingleNode(
        mockCliClientMetadata,
        mockServerInfoCommand,
        ClusterNodeRole.All,
        nodeOptions,
      );
      expect(result).toEqual(mockResult);
      expect(cliTool.execCommandForNode).toHaveBeenCalledWith(
        mockCliClientMetadata,
        'info',
        ['server'],
        ClusterNodeRole.All,
        `${mockNode.host}:${mockNode.port}`,
        'utf8',
      );
      expect(analyticsService.sendClusterCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          response: mockRedisServerInfoResponse,
          ...mockNode,
          status: CommandExecutionStatus.Success,
        },
        {
          command: 'info',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should successfully execute command for single node with redirection (RAW format)', async () => {
      const command = 'set foo bar';
      const mockResult: SendClusterCommandResponse = {
        response: 'OK',
        node: { ...mockNode, port: 7002, slot: 7008 },
        status: CommandExecutionStatus.Success,
      };
      cliTool.execCommandForNode
        .mockResolvedValueOnce({
          response: mockRedisMovedError.message,
          error: mockRedisMovedError,
          status: CommandExecutionStatus.Fail,
        })
        .mockResolvedValueOnce({
          response: 'OK',
          host: '127.0.0.1',
          port: 7002,
          status: CommandExecutionStatus.Success,
        });

      const result = await service.sendCommandForSingleNode(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.All,
        nodeOptions,
        CliOutputFormatterTypes.Raw,
      );

      expect(cliTool.execCommandForNode).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResult);
      expect(analyticsService.sendClusterCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          response: 'OK',
          ...mockNode,
          port: 7002,
          slot: 7008,
          status: CommandExecutionStatus.Success,
        },
        {
          command: 'set',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });
    it('should successfully execute command for single node with redirection (Text format)', async () => {
      const command = 'set foo bar';
      const mockResult: SendClusterCommandResponse = {
        response: '-> Redirected to slot [7008] located at 127.0.0.1:7002\nOK',
        node: { ...mockNode, port: 7002, slot: 7008 },
        status: CommandExecutionStatus.Success,
      };
      cliTool.execCommandForNode
        .mockResolvedValueOnce({
          response: mockRedisMovedError.message,
          error: mockRedisMovedError,
          status: CommandExecutionStatus.Fail,
        })
        .mockResolvedValueOnce({
          response: 'OK',
          host: '127.0.0.1',
          port: 7002,
          status: CommandExecutionStatus.Success,
        });

      const result = await service.sendCommandForSingleNode(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.All,
        nodeOptions,
        CliOutputFormatterTypes.Text,
      );

      expect(cliTool.execCommandForNode).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResult);
      expect(analyticsService.sendClusterCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          response: mockResult.response,
          ...mockNode,
          port: 7002,
          slot: 7008,
          status: CommandExecutionStatus.Success,
        },
        {
          command: 'set',
          outputFormat: CliOutputFormatterTypes.Text,
        },
      );
    });
    it('should return response for single node with redirection error', async () => {
      const command = 'set foo bar';
      const mockResult: SendClusterCommandResponse = {
        response: mockRedisMovedError.message,
        node: mockNode,
        status: CommandExecutionStatus.Fail,
      };
      cliTool.execCommandForNode.mockResolvedValueOnce({
        response: mockRedisMovedError.message,
        error: mockRedisMovedError,
        ...mockNode,
        status: CommandExecutionStatus.Fail,
      });

      const result = await service.sendCommandForSingleNode(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.All,
        { ...nodeOptions, enableRedirection: false },
      );

      expect(cliTool.execCommandForNode).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
      expect(analyticsService.sendClusterCommandExecutedEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        {
          error: mockRedisMovedError,
          response: mockRedisMovedError.message,
          ...mockNode,
          status: CommandExecutionStatus.Fail,
        },
        {
          command: 'set',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });
    it('should return response with [CLI_COMMAND_NOT_SUPPORTED] error for sendCommandForSingleNode', async () => {
      const command = CliToolUnsupportedCommands.ScriptDebug;
      const mockResult: SendClusterCommandResponse = {
        response: ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
          command.toUpperCase(),
        ),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommandForSingleNode(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.All,
        nodeOptions,
      );

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        new CommandNotSupportedError(ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
          command.toUpperCase(),
        )),
        {
          command: 'script',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });
    it('should return response with [CLI_UNTERMINATED_QUOTES] error for sendCommandForSingleNode', async () => {
      const command = mockGetEscapedKeyCommand;
      const mockResult: SendClusterCommandResponse = {
        response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommandForSingleNode(
        mockCliClientMetadata,
        command,
        ClusterNodeRole.All,
        nodeOptions,
      );

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockCliClientMetadata.databaseId,
        new CommandParsingError(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES()),
        {
          command: unknownCommand,
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });
    it('should throw [WrongDatabaseTypeError]', async () => {
      const command = 'get key';
      cliTool.execCommandForNode.mockRejectedValue(
        new WrongDatabaseTypeError(ERROR_MESSAGES.WRONG_DATABASE_TYPE),
      );

      try {
        await service.sendCommandForSingleNode(
          mockCliClientMetadata,
          command,
          ClusterNodeRole.All,
          nodeOptions,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(ERROR_MESSAGES.WRONG_DATABASE_TYPE);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new WrongDatabaseTypeError(ERROR_MESSAGES.WRONG_DATABASE_TYPE),
          {
            command: 'get',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });
    it('should throw [ClusterNodeNotFoundError]', async () => {
      const command = 'get key';
      cliTool.execCommandForNode.mockRejectedValue(
        new ClusterNodeNotFoundError(
          ERROR_MESSAGES.CLUSTER_NODE_NOT_FOUND('127.0.0.1:7002'),
        ),
      );

      try {
        await service.sendCommandForSingleNode(
          mockCliClientMetadata,
          command,
          ClusterNodeRole.All,
          nodeOptions,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new ClusterNodeNotFoundError(
            ERROR_MESSAGES.CLUSTER_NODE_NOT_FOUND('127.0.0.1:7002'),
          ),
          {
            command: 'get',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });
    it('should throw internal exception', async () => {
      const command = 'get key';
      cliTool.execCommandForNode.mockRejectedValue(new Error(mockENotFoundMessage));

      try {
        await service.sendCommandForSingleNode(
          mockCliClientMetadata,
          command,
          ClusterNodeRole.All,
          nodeOptions,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new Error(mockENotFoundMessage),
          {
            command: 'get',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });
    it('Should proxy EncryptionService errors', async () => {
      const command = 'get key';
      cliTool.execCommandForNode.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.sendCommandForSingleNode(
          mockCliClientMetadata,
          command,
          ClusterNodeRole.All,
          nodeOptions,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockCliClientMetadata.databaseId,
          new KeytarUnavailableException(),
          {
            command: 'get',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });

    it('should call recommendationService', async () => {
      const commandInit = mockMemoryUsageCommand;
      const [ command ] = commandInit?.split(' ')
      cliTool.execCommandForNode.mockResolvedValue({
        response: 5,
        ...mockNode,
        status: CommandExecutionStatus.Success,
      });

      await service.sendCommandForSingleNode(
        mockCliClientMetadata,
        commandInit,
        ClusterNodeRole.All,
        nodeOptions,
      );

      expect(recommendationService.check).toBeCalledWith(
        mockCliClientMetadata,
        RECOMMENDATION_NAMES.SEARCH_VISUALIZATION,
        command,
      );

      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });
});
