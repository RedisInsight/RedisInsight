import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAiAccountId,
  mockAiDatabaseId,
  mockAiFullDbContext,
  mockAiIndex,
  mockAiIndexContext,
  mockSessionMetadata,
} from 'src/__mocks__';
import { InMemoryAiContextRepository } from './in-memory.ai.context.repository';

describe('InMemoryAiContextRepository', () => {
  let service: InMemoryAiContextRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InMemoryAiContextRepository,
      ],
    }).compile();

    service = module.get(InMemoryAiContextRepository);
  });

  it('should return null since no data cached', async () => {
    await expect(service.getFullDbContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
    ))
      .resolves.toEqual(null);

    await expect(service.getIndexContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
      mockAiIndex,
    ))
      .resolves.toEqual(null);
  });

  it('should return cached data', async () => {
    await service.setFullDbContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
      mockAiFullDbContext,
    );

    await service.setIndexContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
      mockAiIndex,
      mockAiIndexContext,
    );

    await service.setFullDbContext(
      mockSessionMetadata,
      '2',
      '2',
      {},
    );

    await expect(service.getFullDbContext(mockSessionMetadata, mockAiDatabaseId, mockAiAccountId))
      .resolves.toEqual(mockAiFullDbContext);

    await expect(service.getFullDbContext(mockSessionMetadata, '2', '2'))
      .resolves.toEqual({});
  });

  it('should return cached index context data', async () => {
    await service.setIndexContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
      mockAiIndex,
      mockAiIndexContext,
    );

    await service.setFullDbContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
      mockAiFullDbContext,
    );

    await service.setFullDbContext(
      mockSessionMetadata,
      '2',
      '2',
      { full: 'context' },
    );

    await service.setIndexContext(
      mockSessionMetadata,
      '2',
      '2',
      '2',
      {},
    );

    await service.setIndexContext(
      mockSessionMetadata,
      '2',
      '2',
      '3',
      { index: '3' },
    );

    await expect(service.getIndexContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
      mockAiIndex,
    ))
      .resolves.toEqual(mockAiIndexContext);

    await expect(service.getFullDbContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
    ))
      .resolves.toEqual(mockAiFullDbContext);

    await expect(service.getIndexContext(mockSessionMetadata, '2', '2', '2'))
      .resolves.toEqual({});
    await expect(service.getIndexContext(mockSessionMetadata, '2', '2', '3'))
      .resolves.toEqual({ index: '3' });
    await expect(service.getIndexContext(mockSessionMetadata, '2', '2', '4'))
      .resolves.toEqual(null);

    // reset
    await expect(service.reset(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
    ))
      .resolves.toEqual(undefined);

    await expect(service.getIndexContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
      mockAiIndex,
    ))
      .resolves.toEqual(null);

    await expect(service.getFullDbContext(
      mockSessionMetadata,
      mockAiDatabaseId,
      mockAiAccountId,
    ))
      .resolves.toEqual(null);

    await expect(service.getIndexContext(mockSessionMetadata, '2', '2', '2'))
      .resolves.toEqual({});
    await expect(service.getIndexContext(mockSessionMetadata, '2', '2', '3'))
      .resolves.toEqual({ index: '3' });
    await expect(service.getIndexContext(mockSessionMetadata, '2', '2', '4'))
      .resolves.toEqual(null);
  });
});
