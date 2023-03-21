import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import {
  mockClientMetadata,
  mockQueryBuilderGetMany,
  mockRepository,
  mockDatabase,
  MockType,
} from 'src/__mocks__';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DatabaseRecommendationsProvider }
  from 'src/modules/database-recommendation/providers/database-recommendations.provider';
import { Recommendation } from 'src/modules/database-recommendation/models';
import { DatabaseRecommendationsEntity }
  from 'src/modules/database-recommendation/entities/database-recommendations.entity';

const mockDatabaseRecommendationEntity = new DatabaseRecommendationsEntity({
  id: uuidv4(),
  databaseId: mockDatabase.id,
  name: 'luaScript',
  createdAt: new Date(),
  read: false,
  disabled: false,
});

const mockDatabaseRecommendation = {
  id: mockDatabaseRecommendationEntity.id,
  createdAt: mockDatabaseRecommendationEntity.createdAt,
  databaseId: mockDatabaseRecommendationEntity.databaseId,
  read: mockDatabaseRecommendationEntity.read,
  name: mockDatabaseRecommendationEntity.name,
  disabled: mockDatabaseRecommendationEntity.disabled,
};

describe('DatabaseAnalysisProvider', () => {
  let service: DatabaseRecommendationsProvider;
  let repository: MockType<Repository<Recommendation>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseRecommendationsProvider,
        {
          provide: getRepositoryToken(DatabaseRecommendationsEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DatabaseRecommendationsProvider>(DatabaseRecommendationsProvider);
    repository = module.get(getRepositoryToken(DatabaseRecommendationsEntity));
  });

  describe('create', () => {
    it('should process new entity', async () => {
      repository.save.mockReturnValueOnce(mockDatabaseRecommendationEntity);
      expect(await service.create(
        mockDatabaseRecommendationEntity.databaseId,
        mockDatabaseRecommendationEntity.name,
      )).toEqual(mockDatabaseRecommendation);
    });
  });

  describe('list', () => {
    it('should get list of recommendations', async () => {
      mockQueryBuilderGetMany.mockReturnValueOnce([{
        name: mockDatabaseRecommendation.name,
      }]);
      repository.createQueryBuilder().getCount.mockResolvedValueOnce(1);
      expect(await service.list(mockClientMetadata)).toEqual({
        recommendations: [{
          name: mockDatabaseRecommendation.name,
        }],
        totalUnread: 1,
      });
    });
  });
});
