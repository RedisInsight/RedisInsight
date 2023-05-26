import { Test, TestingModule } from '@nestjs/testing';
import {
  mockDatabaseRecommendation,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { RecommendationServerEvents } from 'src/modules/database-recommendation/constants';
import {
  DatabaseRecommendationEmitter,
} from 'src/modules/database-recommendation/providers/database-recommendation.emitter';
import {
  DatabaseRecommendationEntity,
} from 'src/modules/database-recommendation/entities/database-recommendation.entity';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('DatabaseRecommendationEmitter', () => {
  let service: DatabaseRecommendationEmitter;
  let repository: MockType<Repository<DatabaseRecommendationEntity>>;
  let emitter: MockType<EventEmitter2>;

  beforeEach(async () => {
    // jest.resetAllMocks();
    jest.mock('axios', () => mockedAxios);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseRecommendationEmitter,
        EventEmitter2,
        {
          provide: EventEmitter2,
          useFactory: () => mockEventEmitter,
        },
        {
          provide: getRepositoryToken(DatabaseRecommendationEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = await module.get(DatabaseRecommendationEmitter);
    repository = await module.get(
      getRepositoryToken(DatabaseRecommendationEntity),
    );
    emitter = await module.get(EventEmitter2);
    emitter.emit.mockReset();
  });

  describe('newRecommendation', () => {
    it('should return undefined if no recommendations passed', async () => {
      await service.newRecommendation([]);
      expect(emitter.emit).toHaveBeenCalledTimes(0);
    });
    it('should emit 2 new recommendations', async () => {
      repository.createQueryBuilder().getCount.mockResolvedValueOnce(2);

      await service.newRecommendation([mockDatabaseRecommendation, mockDatabaseRecommendation]);
      expect(emitter.emit).toHaveBeenCalledTimes(1);
      expect(emitter.emit).toHaveBeenCalledWith(
        RecommendationServerEvents.Recommendation,
        mockDatabaseRecommendation.databaseId,
        {
          recommendations: [
            mockDatabaseRecommendation,
            mockDatabaseRecommendation,
          ],
          totalUnread: 2,
        },
      );
    });
    it('should log an error but not fail', async () => {
      repository.createQueryBuilder().getCount.mockRejectedValueOnce(new Error('some error'));

      await service.newRecommendation([mockDatabaseRecommendation]);

      expect(emitter.emit).toHaveBeenCalledTimes(0);
    });
  });
});
