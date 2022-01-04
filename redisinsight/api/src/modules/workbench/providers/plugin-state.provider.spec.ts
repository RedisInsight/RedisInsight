import { Test, TestingModule } from '@nestjs/testing';
import {
  mockEncryptionService,
  mockEncryptResult,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { PluginStateProvider } from 'src/modules/workbench/providers/plugin-state.provider';
import { PluginState } from 'src/modules/workbench/models/plugin-state';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { PluginStateEntity } from 'src/modules/workbench/entities/plugin-state.entity';
import { Repository } from 'typeorm';
import { KeytarDecryptionErrorException } from 'src/modules/core/encryption/exceptions';

const mockVisualizationId = 'pluginName_visualizationName';
const mockCommandExecutionId = uuidv4();
const mockState = {
  some: 'object',
};

const mockPluginStatePartial: Partial<PluginState> = new PluginState({
  visualizationId: mockVisualizationId,
  commandExecutionId: mockCommandExecutionId,
  state: mockState,
});

const mockPluginState: PluginState = new PluginState({
  ...mockPluginStatePartial,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockPluginStateEntity = new PluginStateEntity({
  ...mockPluginState,
  state: mockEncryptResult.data,
  encryption: 'KEYTAR',
});

describe('PluginStateProvider', () => {
  let service: PluginStateProvider;
  let repository: MockType<Repository<PluginStateEntity>>;
  let encryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginStateProvider,
        {
          provide: getRepositoryToken(PluginStateEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get<PluginStateProvider>(PluginStateProvider);
    repository = module.get(getRepositoryToken(PluginStateEntity));
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  describe('upsert', () => {
    it('should process new entity', async () => {
      repository.save.mockReturnValueOnce(mockPluginStateEntity);
      encryptionService.encrypt.mockReturnValue(mockEncryptResult);

      expect(await service.upsert(mockPluginStatePartial)).toEqual(undefined);
    });
  });
  describe('getOne', () => {
    it('should return decrypted and transformed state', async () => {
      repository.findOne.mockResolvedValueOnce(mockPluginStateEntity);
      encryptionService.decrypt.mockReturnValueOnce(JSON.stringify(mockPluginState.state));

      expect(await service.getOne(mockVisualizationId, mockCommandExecutionId)).toEqual(mockPluginState);
    });
    it('should return null fields in case of decryption errors', async () => {
      repository.findOne.mockResolvedValueOnce(mockPluginStateEntity);
      encryptionService.decrypt.mockRejectedValueOnce(new KeytarDecryptionErrorException());

      const result = await service.getOne(mockVisualizationId, mockCommandExecutionId);

      expect(result).toBeInstanceOf(PluginState);
      expect(result).toEqual({
        ...mockPluginState,
        state: null,
      });
    });
    it('should return not found exception', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      try {
        await service.getOne(mockVisualizationId, mockCommandExecutionId);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.PLUGIN_STATE_NOT_FOUND);
      }
    });
  });
});
