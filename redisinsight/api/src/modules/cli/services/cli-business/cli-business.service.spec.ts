import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { when } from 'jest-when';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  mockRedisServerInfoResponse,
  mockRedisWrongTypeError,
  mockStandaloneDatabaseEntity,
  mockCliAnalyticsService,
  mockRedisMovedError,
} from 'src/__mocks__';
import {
  ClusterNodeRole,
  CommandExecutionStatus,
  SendClusterCommandDto,
  SendClusterCommandResponse,
  SendCommandDto,
  SendCommandResponse,
} from 'src/modules/cli/dto/cli.dto';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { ReplyError } from 'src/models';
import { CliToolUnsupportedCommands } from 'src/utils/cli-helper';
import { EndpointDto } from 'src/modules/instances/dto/database-instance.dto';
import { ClusterNodeNotFoundError, WrongDatabaseTypeError } from 'src/modules/cli/constants/errors';
import { CliAnalyticsService } from 'src/modules/cli/services/cli-analytics/cli-analytics.service';
import { KeytarUnavailableException } from 'src/modules/core/encryption/exceptions';
import { OutputFormatterManager } from './output-formatter/output-formatter-manager';
import { CliOutputFormatterTypes, IOutputFormatterStrategy } from './output-formatter/output-formatter.interface';
import { CliToolService } from '../cli-tool/cli-tool.service';
import { CliBusinessService } from './cli-business.service';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};
const mockClientUuid = uuidv4();
const mockNode: EndpointDto = {
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

const mockENotFoundMessage = 'ENOTFOUND some message';
const mockMemoryUsageCommand = 'memory usage key';
const mockGetEscapedKeyCommand = 'get "\\\\key';
const mockServerInfoCommand = 'info server';
const mockIntegerResponse = 5;

describe('CliBusinessService', () => {
  let service: CliBusinessService;
  let cliTool;
  let textFormatter: IOutputFormatterStrategy;
  let rawFormatter: IOutputFormatterStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CliBusinessService,
        {
          provide: CliAnalyticsService,
          useFactory: mockCliAnalyticsService,
        },
        {
          provide: CliToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get<CliBusinessService>(CliBusinessService);
    cliTool = module.get<CliToolService>(CliToolService);
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
      cliTool.createNewToolClient.mockResolvedValue(mockClientUuid);

      const result = await service.getClient(mockStandaloneDatabaseEntity.id);

      expect(result).toEqual({ uuid: mockClientUuid });
    });

    it('should throw internal exception on getClient error', async () => {
      cliTool.createNewToolClient.mockRejectedValue(
        new InternalServerErrorException(mockENotFoundMessage),
      );

      try {
        await service.getClient(mockStandaloneDatabaseEntity.id);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });

    it('Should proxy EncryptionService errors on getClient', async () => {
      cliTool.createNewToolClient.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.getClient(mockStandaloneDatabaseEntity.id);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
      }
    });
  });

  describe('reCreateClient', () => {
    it('should successfully create new redis client', async () => {
      cliTool.reCreateToolClient.mockResolvedValue(mockClientUuid);

      const result = await service.reCreateClient(
        mockStandaloneDatabaseEntity.id,
        mockClientUuid,
      );

      expect(result).toEqual({ uuid: mockClientUuid });
    });

    it('should throw internal exception on reCreateClient', async () => {
      cliTool.reCreateToolClient.mockRejectedValue(
        new InternalServerErrorException(mockENotFoundMessage),
      );

      try {
        await service.reCreateClient(
          mockStandaloneDatabaseEntity.id,
          mockClientUuid,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });

    it('Should proxy EncryptionService errors on reCreateClient', async () => {
      cliTool.reCreateToolClient.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.reCreateClient(
          mockStandaloneDatabaseEntity.id,
          mockClientUuid,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
      }
    });
  });

  describe('deleteClient', () => {
    it('should successfully close redis client', async () => {
      cliTool.deleteToolClient.mockResolvedValue(1);

      const result = await service.deleteClient(
        mockStandaloneDatabaseEntity.id,
        mockClientUuid,
      );

      expect(result).toEqual({ affected: 1 });
    });

    it('should throw internal exception on deleteClient', async () => {
      cliTool.deleteToolClient.mockRejectedValue(new Error(mockENotFoundMessage));

      try {
        await service.deleteClient(
          mockStandaloneDatabaseEntity.id,
          mockClientUuid,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('sendCommand', () => {
    it('should successfully execute command and return text response', async () => {
      const dto: SendCommandDto = { command: mockMemoryUsageCommand };
      const formatSpy = jest.spyOn(rawFormatter, 'format');
      const mockResult: SendCommandResponse = {
        response: mockIntegerResponse,
        status: CommandExecutionStatus.Success,
      };
      when(cliTool.execCommand)
        .calledWith(mockClientOptions, 'memory', ['usage', 'key'], undefined)
        .mockReturnValue(5);

      const result = await service.sendCommand(mockClientOptions, dto);

      expect(result).toEqual(mockResult);
      expect(formatSpy).toHaveBeenCalled();
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
        .calledWith(mockClientOptions, 'memory', ['usage', 'key'], undefined)
        .mockReturnValue(5);

      const result = await service.sendCommand(mockClientOptions, dto);

      expect(result).toEqual(mockResult);
      expect(formatSpy).toHaveBeenCalled();
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

      const result = await service.sendCommand(mockClientOptions, dto);

      expect(result).toEqual(mockResult);
    });

    it('should return response with [CLI_UNTERMINATED_QUOTES] error for sendCommand', async () => {
      const command = mockGetEscapedKeyCommand;
      const dto: SendCommandDto = { command };
      const mockResult: SendCommandResponse = {
        response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockClientOptions, dto);

      expect(result).toEqual(mockResult);
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

      const result = await service.sendCommand(mockClientOptions, dto);

      expect(result).toEqual(mockResult);
    });

    it('should throw internal exception for sendCommand', async () => {
      const dto: SendCommandDto = { command: 'get key' };
      cliTool.execCommand.mockRejectedValue(new Error(mockENotFoundMessage));

      try {
        await service.sendCommand(mockClientOptions, dto);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });

    it('Should proxy EncryptionService errors for sendCommand', async () => {
      const dto: SendCommandDto = { command: 'get key' };
      cliTool.execCommand.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.sendCommand(mockClientOptions, dto);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
      }
    });
    it('should return response in correct format for human-readable commands for sendCommand', async () => {
      const dto: SendCommandDto = { command: mockServerInfoCommand };
      const mockResult: SendCommandResponse = {
        response: mockRedisServerInfoResponse,
        status: CommandExecutionStatus.Success,
      };
      when(cliTool.execCommand)
        .calledWith(mockClientOptions, 'info', ['server'], 'utf8')
        .mockReturnValue(mockRedisServerInfoResponse);

      const result = await service.sendCommand(mockClientOptions, dto);

      expect(result).toEqual(mockResult);
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

      await service.sendClusterCommand(mockClientOptions, dto);

      expect(service.sendCommandForNodes).toHaveBeenCalled();
    });
    it('should call sendCommandForSingleNode method', async () => {
      const dto: SendClusterCommandDto = {
        command: mockMemoryUsageCommand,
        role: ClusterNodeRole.All,
        nodeOptions: { ...mockNode, enableRedirection: true },
      };

      await service.sendClusterCommand(mockClientOptions, dto);

      expect(service.sendCommandForSingleNode).toHaveBeenCalled();
    });

    it('Should proxy EncryptionService errors for sendClusterCommand', async () => {
      const dto: SendClusterCommandDto = {
        command: mockMemoryUsageCommand,
        role: ClusterNodeRole.All,
        nodeOptions: { ...mockNode, enableRedirection: true },
      };
      service.sendCommandForSingleNode = jest.fn().mockRejectedValue(new KeytarUnavailableException());

      await expect(service.sendClusterCommand(mockClientOptions, dto)).rejects.toThrow(KeytarUnavailableException);
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
        mockClientOptions,
        command,
        ClusterNodeRole.Master,
      );

      expect(result).toEqual(mockResult);
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
        mockClientOptions,
        mockServerInfoCommand,
        ClusterNodeRole.Master,
      );

      expect(result).toEqual(mockResult);
      expect(cliTool.execCommandForNodes).toHaveBeenCalledWith(
        mockClientOptions,
        'info',
        ['server'],
        ClusterNodeRole.Master,
        'utf8',
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
        mockClientOptions,
        command,
        ClusterNodeRole.Master,
      );

      expect(result).toEqual(mockResult);
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
        mockClientOptions,
        command,
        ClusterNodeRole.Master,
      );

      expect(result).toEqual(mockResult);
    });
    it('should throw [WrongDatabaseTypeError]', async () => {
      const command = mockMemoryUsageCommand;
      cliTool.execCommandForNodes.mockRejectedValue(
        new WrongDatabaseTypeError(ERROR_MESSAGES.WRONG_DATABASE_TYPE),
      );

      try {
        await service.sendCommandForNodes(
          mockClientOptions,
          command,
          ClusterNodeRole.Master,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(ERROR_MESSAGES.WRONG_DATABASE_TYPE);
      }
    });
    it('should throw internal exception', async () => {
      const command = mockMemoryUsageCommand;
      cliTool.execCommandForNodes.mockRejectedValue(new Error(mockENotFoundMessage));

      try {
        await service.sendCommandForNodes(
          mockClientOptions,
          command,
          ClusterNodeRole.Master,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
    it('Should proxy EncryptionService errors', async () => {
      const command = mockMemoryUsageCommand;
      cliTool.execCommandForNodes.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.sendCommandForNodes(
          mockClientOptions,
          command,
          ClusterNodeRole.Master,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
      }
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
        mockClientOptions,
        command,
        ClusterNodeRole.All,
        nodeOptions,
      );
      expect(result).toEqual(mockResult);
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
        mockClientOptions,
        mockServerInfoCommand,
        ClusterNodeRole.All,
        nodeOptions,
      );
      expect(result).toEqual(mockResult);
      expect(cliTool.execCommandForNode).toHaveBeenCalledWith(
        mockClientOptions,
        'info',
        ['server'],
        ClusterNodeRole.All,
        `${mockNode.host}:${mockNode.port}`,
        'utf8',
      );
    });

    it('should successfully execute command for single node with redirection (RAW format)', async () => {
      const command = 'set foo bar';
      const mockResult: SendClusterCommandResponse = {
        response: 'OK',
        node: { ...mockNode, port: 7002 },
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
        mockClientOptions,
        command,
        ClusterNodeRole.All,
        nodeOptions,
        CliOutputFormatterTypes.Raw,
      );

      expect(cliTool.execCommandForNode).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResult);
    });
    it('should successfully execute command for single node with redirection (Text format)', async () => {
      const command = 'set foo bar';
      const mockResult: SendClusterCommandResponse = {
        response: '-> Redirected to slot [7008] located at 127.0.0.1:7002\nOK',
        node: { ...mockNode, port: 7002 },
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
        mockClientOptions,
        command,
        ClusterNodeRole.All,
        nodeOptions,
        CliOutputFormatterTypes.Text,
      );

      expect(cliTool.execCommandForNode).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResult);
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
        mockClientOptions,
        command,
        ClusterNodeRole.All,
        { ...nodeOptions, enableRedirection: false },
      );

      expect(cliTool.execCommandForNode).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
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
        mockClientOptions,
        command,
        ClusterNodeRole.All,
        nodeOptions,
      );

      expect(result).toEqual(mockResult);
    });
    it('should return response with [CLI_UNTERMINATED_QUOTES] error for sendCommandForSingleNode', async () => {
      const command = mockGetEscapedKeyCommand;
      const mockResult: SendClusterCommandResponse = {
        response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommandForSingleNode(
        mockClientOptions,
        command,
        ClusterNodeRole.All,
        nodeOptions,
      );

      expect(result).toEqual(mockResult);
    });
    it('should throw [WrongDatabaseTypeError]', async () => {
      const command = 'get key';
      cliTool.execCommandForNode.mockRejectedValue(
        new WrongDatabaseTypeError(ERROR_MESSAGES.WRONG_DATABASE_TYPE),
      );

      try {
        await service.sendCommandForSingleNode(
          mockClientOptions,
          command,
          ClusterNodeRole.All,
          nodeOptions,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(ERROR_MESSAGES.WRONG_DATABASE_TYPE);
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
          mockClientOptions,
          command,
          ClusterNodeRole.All,
          nodeOptions,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
      }
    });
    it('should throw internal exception', async () => {
      const command = 'get key';
      cliTool.execCommandForNodes.mockRejectedValue(new Error(mockENotFoundMessage));

      try {
        await service.sendCommandForSingleNode(
          mockClientOptions,
          command,
          ClusterNodeRole.All,
          nodeOptions,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
    it('Should proxy EncryptionService errors', async () => {
      const command = 'get key';
      cliTool.execCommandForNode.mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.sendCommandForSingleNode(
          mockClientOptions,
          command,
          ClusterNodeRole.All,
          nodeOptions,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
      }
    });
  });
});
