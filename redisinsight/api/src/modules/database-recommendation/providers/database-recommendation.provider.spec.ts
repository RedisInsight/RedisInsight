import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseRecommendation, Vote } from 'src/modules/database-recommendation/models';

const mockDatabaseRecommendationEntity = new DatabaseRecommendationEntity({
  id: uuidv4(),
  databaseId: mockDatabase.id,
  name: 'luaScript',
  createdAt: new Date(),
  read: false,
  disabled: false,
  hide: false,
  vote: null,
});

const mockDatabaseRecommendation = {
  id: mockDatabaseRecommendationEntity.id,
  createdAt: mockDatabaseRecommendationEntity.createdAt,
  databaseId: mockDatabaseRecommendationEntity.databaseId,
  read: mockDatabaseRecommendationEntity.read,
  name: mockDatabaseRecommendationEntity.name,
  disabled: mockDatabaseRecommendationEntity.disabled,
  hide: mockDatabaseRecommendationEntity.hide,
  vote: mockDatabaseRecommendationEntity.vote,
};

const mockDatabaseRecommendationVoted = {
  ...mockDatabaseRecommendationEntity,
  vote: Vote.Like,
};

const mockDatabaseRecommendationHidden = {
  ...mockDatabaseRecommendationEntity,
  hide: true,
};

const mockDBAnalysisRecommendation1 = {
  name: 'RTS',
};

const mockDBAnalysisRecommendation2 = {
  name: 'bigSets',
};

const mockDBAnalysisRecommendation3 = {
  name: 'setPassword',
};

describe('DatabaseRecommendationProvider', () => {
  let service: DatabaseRecommendationProvider;
  let repository: MockType<Repository<DatabaseRecommendationEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseRecommendationProvider,
        EventEmitter2,
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
        mockClientMetadata,
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

  describe('isExist', () => {
    it('should return true when findOneBy recommendation', async () => {
      repository.findOneBy.mockReturnValueOnce('some');

      expect(await service.isExist(mockClientMetadata, mockDatabaseRecommendation.name)).toEqual(true);
    });

    it('should return false when not findOneBy recommendation', async () => {
      repository.findOneBy.mockReturnValueOnce(null);

      expect(await service.isExist(mockClientMetadata, mockDatabaseRecommendation.name)).toEqual(false);
    });

    it('should return false when findOneBy throw error', async () => {
      repository.findOneBy.mockRejectedValue('some error');

      expect(await service.isExist(mockClientMetadata, mockDatabaseRecommendation.name)).toEqual(false);
    });
  });

  describe('update', () => {
    it('should call "update" with the vote value', async () => {
      const { vote } = mockDatabaseRecommendationVoted;
      repository.findOneBy.mockReturnValueOnce(mockDatabaseRecommendationEntity);
      repository.merge.mockReturnValue(mockDatabaseRecommendationVoted);

      await service.update(mockClientMetadata, mockDatabaseRecommendation.id, { vote });
      expect(repository.update).toBeCalledWith(
        mockDatabaseRecommendationEntity.id,
        { ...mockDatabaseRecommendationEntity, vote },
      );
    });
    it('should call "update" with the hide value', async () => {
      const { hide } = mockDatabaseRecommendationHidden;
      repository.findOneBy.mockReturnValueOnce(mockDatabaseRecommendationEntity);
      repository.merge.mockReturnValue(mockDatabaseRecommendationHidden);

      await service.update(mockClientMetadata, mockDatabaseRecommendation.id, { hide });
      expect(repository.update).toBeCalledWith(
        mockDatabaseRecommendationEntity.id,
        { ...mockDatabaseRecommendationEntity, hide },
      );
    });
  });

  describe('sync', () => {
    it('should call "create" with new recommendations', async () => {
      const createSpy = jest.spyOn(service, 'create');
      const isExistSpy = jest.spyOn(service, 'isExist');
      isExistSpy.mockResolvedValue(false);

      await service.sync(
        mockClientMetadata,
        [mockDBAnalysisRecommendation1, mockDBAnalysisRecommendation3],
      );
      expect(createSpy).toBeCalledTimes(2);
      expect(createSpy).toBeCalledWith(
        mockClientMetadata,
        mockDBAnalysisRecommendation1.name,
      );
      expect(createSpy).toBeCalledWith(
        mockClientMetadata,
        mockDBAnalysisRecommendation3.name,
      );
    });

    it('should not call "create" with exist recommendations', async () => {
      const createSpy = jest.spyOn(service, 'create');
      const isExistSpy = jest.spyOn(service, 'isExist');
      isExistSpy.mockResolvedValueOnce(false);
      isExistSpy.mockResolvedValueOnce(true);

      await service.sync(
        mockClientMetadata,
        [mockDBAnalysisRecommendation1, mockDBAnalysisRecommendation2],
      );
      expect(createSpy).toBeCalledTimes(1);
      expect(createSpy).toBeCalledWith(
        mockClientMetadata,
        mockDBAnalysisRecommendation1.name,
      );
      expect(createSpy).not.toBeCalledWith(
        mockClientMetadata,
        mockDBAnalysisRecommendation2.name,
      );
    });

    it('should not throw error when create service throw error', async () => {
      const createSpy = jest.spyOn(service, 'create');
      createSpy.mockRejectedValue('error');
      const isExistSpy = jest.spyOn(service, 'isExist');
      isExistSpy.mockResolvedValueOnce(true);

      expect(async () => await service.sync(
        mockClientMetadata,
        [mockDBAnalysisRecommendation1],
      )).not.toThrow();
    });

    it('should not call "create" if there are no new recommendations', async () => {
      const createSpy = jest.spyOn(service, 'create');
      const isExistSpy = jest.spyOn(service, 'isExist');
      isExistSpy.mockResolvedValueOnce(true);

      await service.sync(mockClientMetadata, [mockDBAnalysisRecommendation2]);
      expect(createSpy).toBeCalledTimes(0);
    });

    it('should not throw error when isExist service throw error', async () => {
      const createSpy = jest.spyOn(service, 'create');

      const isExistSpy = jest.spyOn(service, 'isExist');
      isExistSpy.mockRejectedValue('error');

      expect(async () => await service.sync(
        mockClientMetadata,
        [mockDBAnalysisRecommendation1],
      )).not.toThrow();
      expect(createSpy).not.toBeCalled();
    });
  });

  describe('delete', () => {
    it('should delete database recommendation by id', async () => {
      repository.delete.mockReturnValueOnce({ affected: 1 });
      expect(
        await service.delete(mockClientMetadata, mockDatabaseRecommendation.id),
      ).toEqual(undefined);
    });

    it('should throw InternalServerErrorException? on any error during deletion', async () => {
      repository.delete.mockRejectedValueOnce(new NotFoundException());
      await expect(
        service.delete(mockClientMetadata, mockDatabaseRecommendation.id),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
