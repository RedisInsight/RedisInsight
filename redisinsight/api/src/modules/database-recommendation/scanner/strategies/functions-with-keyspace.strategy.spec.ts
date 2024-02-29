import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { mockDatabaseService, mockStandaloneRedisClient } from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { FunctionsWithKeyspaceStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const mockDatabaseId = 'id';

const mockEmptyLibraries = [];
const mockLibraries = ['library'];

const mockResponseWithTriggers = ['notify-keyspace-events', 'KEA'];
const mockResponseWithoutTriggers = ['notify-keyspace-events', 'X'];

describe('FunctionsWithKeyspaceStrategy', () => {
  const client = mockStandaloneRedisClient;
  let strategy;
  let databaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
      ],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);
    strategy = new FunctionsWithKeyspaceStrategy(databaseService);
  });

  describe('isRecommendationReached', () => {
    describe('with triggered and functions module', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue({ modules: [{ name: 'redisgears' }] });
      });

      it('should return true when there is keyspace notification', async () => {
        when(client.sendCommand)
          .calledWith(jasmine.arrayContaining(['TFUNCTION']), expect.anything())
          .mockResolvedValueOnce(mockEmptyLibraries);

        when(client.sendCommand)
          .calledWith(jasmine.arrayContaining(['CONFIG']), expect.anything())
          .mockResolvedValueOnce(mockResponseWithTriggers);

        expect(await strategy.isRecommendationReached({
          client,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: true });
      });

      it('should return false when there is no keyspace notifications', async () => {
        when(client.sendCommand)
          .calledWith(jasmine.arrayContaining(['TFUNCTION']), expect.anything())
          .mockResolvedValueOnce(mockEmptyLibraries);

        when(client.sendCommand)
          .calledWith(jasmine.arrayContaining(['CONFIG']), expect.anything())
          .mockResolvedValueOnce(mockResponseWithoutTriggers);

        expect(await strategy.isRecommendationReached({
          client,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: false });
      });

      it('should return false when TFUNCTION return libraries', async () => {
        when(client.sendCommand)
          .calledWith(jasmine.arrayContaining(['TFUNCTION']), expect.anything())
          .mockResolvedValueOnce(mockLibraries);

        expect(await strategy.isRecommendationReached({
          client,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: false });
      });
    });

    describe('without triggered and functions module', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue({ modules: ['custom'] });
      });

      it('should return true when there is keyspace notification', async () => {
        when(client.sendCommand)
          .calledWith(jasmine.arrayContaining(['CONFIG']), expect.anything())
          .mockResolvedValueOnce(mockResponseWithTriggers);

        expect(await strategy.isRecommendationReached({
          client,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: true });
      });

      it('should return false when there is no keyspace notifications', async () => {
        when(client.sendCommand)
          .calledWith(jasmine.arrayContaining(['CONFIG']), expect.anything())
          .mockResolvedValueOnce(mockResponseWithoutTriggers);

        expect(await strategy.isRecommendationReached({
          client,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: false });
      });
    });
  });
});
