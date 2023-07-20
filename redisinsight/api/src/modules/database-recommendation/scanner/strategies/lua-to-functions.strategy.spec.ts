import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import IORedis from 'ioredis';
import { mockDatabaseService } from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { LuaToFunctionsStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockDatabaseId = 'id';

const mockEmptyLibraries = [];
const mockLibraries = ['library'];

describe('LuaToFunctionsStrategy', () => {
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
    strategy = new LuaToFunctionsStrategy(databaseService);
  });

  describe('isRecommendationReached', () => {
    describe('with triggered and functions module', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue({ modules: [{ name: 'redisgears' }] });
      });

      it('should return true when there is more then 0 lua script', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'TFUNCTION' }))
          .mockResolvedValue(mockEmptyLibraries);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          info: { cashedScripts: 1 },
        })).toEqual({ isReached: true });
      });

      it('should return false when number of cached lua script is 0', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'TFUNCTION' }))
          .mockResolvedValue(mockEmptyLibraries);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          info: { cashedScripts: 0 },
        })).toEqual({ isReached: false });
      });

      it('should return false when TFUNCTION return libraries', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'TFUNCTION' }))
          .mockResolvedValue(mockLibraries);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: false });
      });
    });

    describe('without triggered and functions module', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue({ modules: ['custom'] });
      });

      it('should return true when there is more then 1 lua script', async () => {
        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          info: { cashedScripts: 1 },
        })).toEqual({ isReached: true });
      });

      it('should return false when number of cached lua script is 0', async () => {
        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          info: { cashedScripts: 0 },
        })).toEqual({ isReached: false });
      });
    });
  });
});
