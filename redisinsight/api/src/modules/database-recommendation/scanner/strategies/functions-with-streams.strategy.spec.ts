import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import IORedis from 'ioredis';
import { mockDatabaseService } from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { FunctionsWithStreamsStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockDatabaseId = 'id';

const mockStreamInfo: GetKeyInfoResponse = {
  name: Buffer.from('testString_1'),
  type: 'stream',
  ttl: -1,
  size: 1,
};

const mockHashInfo: GetKeyInfoResponse = {
  name: Buffer.from('testString_2'),
  type: 'hash',
  ttl: -1,
  size: 1,
};

const mockEmptyLibraries = [];
const mockLibraries = ['library'];

describe('FunctionsWithStreamsStrategy', () => {
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
    strategy = new FunctionsWithStreamsStrategy(databaseService);
  });

  describe('isRecommendationReached', () => {
    describe('with triggered and functions module', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue({ modules: [{ name: 'redisgears' }] });
      });

      it('should return true when there is stream key', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'TFUNCTION' }))
          .mockResolvedValue(mockEmptyLibraries);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockStreamInfo, mockHashInfo],
        })).toEqual({ isReached: true });
      });

      it('should return false when there is not stream key', async () => {
        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockHashInfo],
        })).toEqual({ isReached: false });
      });

      it('should return false when TFUNCTION return libraries', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'TFUNCTION' }))
          .mockResolvedValue(mockLibraries);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockStreamInfo, mockHashInfo],
        })).toEqual({ isReached: false });
      });
    });

    describe('without triggered and functions module', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue({ modules: ['custom'] });
      });

      it('should return true when there is stream key', async () => {
        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockStreamInfo, mockHashInfo],
        })).toEqual({ isReached: true });
      });

      it('should return false when there is not stream key', async () => {
        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockHashInfo],
        })).toEqual({ isReached: false });
      });
    });
  });
});
