import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import IORedis from 'ioredis';
import { mockDatabaseService } from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { FunctionsWithKeyspaceStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockDatabaseId = 'id';

const mockEmptyLibraries = [];
const mockLibraries = ['library'];

const mockResponseWithTriggers = ['notify-keyspace-events', 'KEA'];
const mockResponseWithoutTriggers = ['notify-keyspace-events', 'X'];

describe('FunctionsWithKeyspaceStrategy', () => {
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
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'TFUNCTION' }))
          .mockResolvedValueOnce(mockEmptyLibraries);

        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'CONFIG' }))
          .mockResolvedValueOnce(mockResponseWithTriggers);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: true });
      });

      it('should return false when there is no keyspace notifications', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'TFUNCTION' }))
          .mockResolvedValueOnce(mockEmptyLibraries);

        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'CONFIG' }))
          .mockResolvedValueOnce(mockResponseWithoutTriggers);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: false });
      });

      it('should return false when TFUNCTION return libraries', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'TFUNCTION' }))
          .mockResolvedValueOnce(mockLibraries);

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

      it('should return true when there is keyspace notification', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'CONFIG' }))
          .mockResolvedValueOnce(mockResponseWithTriggers);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: true });
      });

      it('should return false when there is no keyspace notifications', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'CONFIG' }))
          .mockResolvedValueOnce(mockResponseWithoutTriggers);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
        })).toEqual({ isReached: false });
      });
    });
  });
});
