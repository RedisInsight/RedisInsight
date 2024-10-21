import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAiAccountId,
  mockAiAiResponse,
  mockAiAiResponse2,
  mockAiAiResponseEntity,
  mockAiAiResponseEntity2,
  mockAiDatabaseId,
  mockAiHumanMessage,
  mockAiHumanMessage2,
  mockAiHumanMessageEntity,
  mockAiHumanMessageEntity2,
  mockEncryptionService,
  mockRepository,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { when } from 'jest-when';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiMessageEntity } from 'src/modules/ai/messages/entities/ai.message.entity';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { KeytarEncryptionErrorException } from 'src/modules/encryption/exceptions';
import { LocalAiMessageRepository } from './local.ai.message.repository';

describe('LocalAiAuthProvider', () => {
  let service: LocalAiMessageRepository;
  let repository: MockType<Repository<AiMessageEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAiMessageRepository,
        {
          provide: getRepositoryToken(AiMessageEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get(LocalAiMessageRepository);
    encryptionService = module.get(EncryptionService);
    repository = module.get(getRepositoryToken(AiMessageEntity));

    encryptionService.decrypt.mockImplementation((value) => value);
    when(encryptionService.decrypt)
      .calledWith(mockAiHumanMessageEntity.content, jasmine.anything())
      .mockResolvedValue(mockAiHumanMessage.content)
      .calledWith(mockAiAiResponseEntity.content, jasmine.anything())
      .mockResolvedValue(mockAiAiResponse.content)
      .calledWith(mockAiAiResponseEntity.steps, jasmine.anything())
      .mockResolvedValue(JSON.stringify(mockAiAiResponse.steps));

    encryptionService.encrypt.mockImplementation((value) => value);
    when(encryptionService.encrypt)
      .calledWith(mockAiHumanMessage.content, jasmine.anything())
      .mockResolvedValue(mockAiHumanMessageEntity.content)
      .calledWith(mockAiAiResponse.content, jasmine.anything())
      .mockResolvedValue(mockAiAiResponseEntity.content)
      .calledWith(JSON.stringify(mockAiAiResponse.steps), jasmine.anything())
      .mockResolvedValue(mockAiAiResponseEntity.steps);
  });

  describe('cleanupHistory', () => {
    beforeEach(() => {
      repository.createQueryBuilder().getRawMany.mockResolvedValueOnce([mockAiHumanMessage.id]);
    });

    it('should get id to and remove it', async () => {
      await expect(service['cleanupHistory'](mockAiDatabaseId, mockAiAccountId))
        .resolves.toEqual(undefined);
    });
  });

  describe('list', () => {
    beforeEach(() => {
      repository.createQueryBuilder().getMany.mockResolvedValueOnce([
        mockAiHumanMessageEntity,
        mockAiAiResponseEntity,
        mockAiHumanMessageEntity2,
        mockAiAiResponseEntity2,
      ]);
    });

    it('should return list of messages', async () => {
      await expect(service.list(mockSessionMetadata, mockAiDatabaseId, mockAiAccountId))
        .resolves.toEqual([
          mockAiHumanMessage,
          mockAiAiResponse,
          mockAiHumanMessage2,
          mockAiAiResponse2,
        ]);
    });

    it('should ignore messages on decryption error', async () => {
      encryptionService.decrypt.mockRejectedValueOnce(new Error('Unable to decrypt'));

      await expect(service.list(mockSessionMetadata, mockAiDatabaseId, mockAiAccountId))
        .resolves.toEqual([
          mockAiAiResponse,
          mockAiHumanMessage2,
          mockAiAiResponse2,
        ]);
    });
  });

  describe('createMany', () => {
    it('should 2 messages', async () => {
      await expect(service.createMany(mockSessionMetadata, [
        mockAiHumanMessage,
        mockAiAiResponse,
      ]))
        .resolves.toEqual(undefined);
    });

    it('should reject on encryption error', async () => {
      encryptionService.encrypt.mockRejectedValueOnce(new KeytarEncryptionErrorException());

      await expect(service.createMany(mockSessionMetadata, [
        mockAiHumanMessage,
        mockAiAiResponse,
      ]))
        .rejects.toEqual(new KeytarEncryptionErrorException());
    });
  });

  describe('clearHistory', () => {
    it('should clear history', async () => {
      await expect(service.clearHistory(mockSessionMetadata, mockAiDatabaseId, mockAiAccountId))
        .resolves.toEqual(undefined);
    });
  });
});
