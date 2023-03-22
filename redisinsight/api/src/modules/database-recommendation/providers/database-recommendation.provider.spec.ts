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
import { DatabaseRecommendationProvider }
  from 'src/modules/database-recommendation/providers/database-recommendation.provider';
import { DatabaseRecommendationEntity }
  from 'src/modules/database-recommendation/entities/database-recommendation.entity';

const mockDatabaseRecommendationEntity = new DatabaseRecommendationEntity({
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
  let service: DatabaseRecommendationProvider;
  let repository: MockType<Repository<DatabaseRecommendationEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseRecommendationProvider,
        {
          provide: getRepositoryToken(DatabaseRecommendationEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DatabaseRecommendationProvider>(DatabaseRecommendationProvider);
    repository = module.get(getRepositoryToken(DatabaseRecommendationEntity));
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

  describe('read', () => {
    it('should read all recommendations', async () => {
      repository.createQueryBuilder().set.mockResolvedValueOnce('ok');

      expect(await service.read(mockClientMetadata)).toEqual(undefined);
    });
  });
});
