import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import {
  mockEncryptionService,
  mockEncryptResult,
  mockQueryBuilderGetMany,
  mockRepository,
  mockStandaloneDatabaseEntity,
  MockType,
} from 'src/__mocks__';
import { omit } from 'lodash';
import { ClusterNodeRole, CreateCommandExecutionDto } from 'src/modules/workbench/dto/create-command-execution.dto';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import {
  NotFoundException,
} from '@nestjs/common';
import { ICliExecResultFromNode } from 'src/modules/cli/services/cli-tool/cli-tool.service';
import { CommandExecutionProvider } from 'src/modules/workbench/providers/command-execution.provider';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { KeytarDecryptionErrorException } from 'src/modules/core/encryption/exceptions';
import ERROR_MESSAGES from 'src/constants/error-messages';

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

const mockCommandExecutionEntity = new CommandExecutionEntity({
  id: uuidv4(),
  databaseId: mockStandaloneDatabaseEntity.id,
  command: mockEncryptResult.data,
  result: mockEncryptResult.data,
  role: mockCreateCommandExecutionDto.role,
  nodeOptions: JSON.stringify(mockCreateCommandExecutionDto.nodeOptions),
  encryption: 'KEYTAR',
  createdAt: new Date(),
});

const mockCommandExecutionResult: CommandExecutionResult = {
  status: mockCliNodeResponse.status,
  response: mockCliNodeResponse.response,
  node: {
    ...mockNodeEndpoint,
  },
};

const mockCommandExecutionPartial: Partial<CommandExecution> = new CommandExecution({
  ...mockCreateCommandExecutionDto,
  databaseId: mockStandaloneDatabaseEntity.id,
  result: [mockCommandExecutionResult],
});

describe('CommandExecutionProvider', () => {
  let service: CommandExecutionProvider;
  let repository: MockType<Repository<CommandExecutionEntity>>;
  let encryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandExecutionProvider,
        {
          provide: getRepositoryToken(CommandExecutionEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get<CommandExecutionProvider>(CommandExecutionProvider);
    repository = module.get(getRepositoryToken(CommandExecutionEntity));
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  describe('create', () => {
    it('should process new entity', async () => {
      repository.save.mockReturnValueOnce(mockCommandExecutionEntity);
      encryptionService.encrypt.mockReturnValue(mockEncryptResult);
      encryptionService.decrypt.mockReturnValueOnce(mockCreateCommandExecutionDto.command);
      encryptionService.decrypt.mockReturnValueOnce(JSON.stringify([mockCommandExecutionResult]));

      expect(await service.create(mockCommandExecutionPartial)).toEqual(new CommandExecution({
        ...mockCommandExecutionPartial,
        id: mockCommandExecutionEntity.id,
        createdAt: mockCommandExecutionEntity.createdAt,
      }));
    });
  });
  describe('getList', () => {
    it('should return list (2) of command execution', async () => {
      const entityResponse = omit(mockCommandExecutionEntity, 'result');
      mockQueryBuilderGetMany.mockReturnValueOnce([entityResponse, entityResponse]);
      encryptionService.decrypt.mockReturnValueOnce(mockCreateCommandExecutionDto.command);
      encryptionService.decrypt.mockReturnValueOnce(mockCreateCommandExecutionDto.command);

      const commandExecution = new CommandExecution({
        ...omit(mockCommandExecutionPartial, ['result']),
        id: mockCommandExecutionEntity.id,
        createdAt: mockCommandExecutionEntity.createdAt,
      });

      expect(await service.getList(mockCommandExecutionEntity.databaseId)).toEqual([
        commandExecution,
        commandExecution,
      ]);
    });
    it('should return list (1) of command execution without failed decrypted item', async () => {
      const entityResponse = omit(mockCommandExecutionEntity, 'result');
      mockQueryBuilderGetMany.mockReturnValueOnce([entityResponse, entityResponse]);
      encryptionService.decrypt.mockReturnValueOnce(mockCreateCommandExecutionDto.command);
      encryptionService.decrypt.mockRejectedValueOnce(new KeytarDecryptionErrorException());

      const commandExecution = new CommandExecution({
        ...omit(mockCommandExecutionPartial, ['result']),
        id: mockCommandExecutionEntity.id,
        createdAt: mockCommandExecutionEntity.createdAt,
      });

      expect(await service.getList(mockCommandExecutionEntity.databaseId)).toEqual([
        commandExecution,
      ]);
    });
  });
  describe('getOne', () => {
    it('should return decrypted and transformed command execution', async () => {
      repository.findOne.mockResolvedValueOnce(mockCommandExecutionEntity);
      encryptionService.decrypt.mockReturnValueOnce(mockCreateCommandExecutionDto.command);
      encryptionService.decrypt.mockReturnValueOnce(JSON.stringify([mockCommandExecutionResult]));

      const commandExecution = new CommandExecution({
        ...mockCommandExecutionPartial,
        id: mockCommandExecutionEntity.id,
        createdAt: mockCommandExecutionEntity.createdAt,
      });

      expect(await service.getOne(mockStandaloneDatabaseEntity.id, mockCommandExecutionEntity.id)).toEqual(
        commandExecution,
      );
    });
    it('should return null fields in case of decryption errors', async () => {
      repository.findOne.mockResolvedValueOnce(mockCommandExecutionEntity);
      encryptionService.decrypt.mockReturnValueOnce(mockCreateCommandExecutionDto.command);
      encryptionService.decrypt.mockRejectedValueOnce(new KeytarDecryptionErrorException());

      const commandExecution = new CommandExecution({
        ...mockCommandExecutionPartial,
        id: mockCommandExecutionEntity.id,
        createdAt: mockCommandExecutionEntity.createdAt,
        result: null,
      });

      expect(await service.getOne(mockStandaloneDatabaseEntity.id, mockCommandExecutionEntity.id)).toEqual(
        commandExecution,
      );
    });
    it('should return not found exception', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      try {
        await service.getOne(mockStandaloneDatabaseEntity.id, mockCommandExecutionEntity.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.COMMAND_EXECUTION_NOT_FOUND);
      }
    });
  });
});
