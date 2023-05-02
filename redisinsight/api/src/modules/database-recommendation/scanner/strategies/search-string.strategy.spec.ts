import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import IORedis from 'ioredis';
import { mockDatabaseService } from 'src/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import { GetKeyInfoResponse } from 'src/modules/browser/dto';
import { SearchStringStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockDatabaseId = 'id';

const mockStringInfo: GetKeyInfoResponse = {
  name: Buffer.from('testString_1'),
  type: 'string',
  ttl: -1,
  size: 50,
};

const mockBigStringInfo: GetKeyInfoResponse = {
  name: Buffer.from('testString_2'),
  type: 'string',
  ttl: -1,
  size: 512 * 1024 + 1,
};

const mockHashInfo: GetKeyInfoResponse = {
  name: Buffer.from('testString_2'),
  type: 'hash',
  ttl: -1,
  size: 512 * 1024 + 1,
};

const mockEmptyIndexes = [];
const mockIndexes = ['foo'];

describe('SearchStringStrategy', () => {
  let strategy: SearchStringStrategy;
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
    strategy = new SearchStringStrategy(databaseService);
  });

  describe('isRecommendationReached', () => {
    describe('with search module', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue({ modules: [{ name: 'search' }] });
      });

      it('should return false when string size < 512 * 1024', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
          .mockResolvedValue(mockEmptyIndexes);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockStringInfo, mockHashInfo],
        })).toEqual({ isReached: false });
      });

      it('should return true when string size > 512 * 1024', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
          .mockResolvedValue(mockEmptyIndexes);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockBigStringInfo, mockHashInfo],
        })).toEqual({ isReached: true, params: { keys: [mockBigStringInfo.name] } });
      });

      it('should return false when FT._LIST return indexes', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
          .mockResolvedValue(mockIndexes);

        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockBigStringInfo, mockHashInfo],
        })).toEqual({ isReached: false });
      });
    });

    describe('without search module', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue({ modules: [] });
      });

      it('should return false when string size < 512 * 1024', async () => {
        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockStringInfo, mockHashInfo],
        })).toEqual({ isReached: false });
      });

      it('should return true when string size > 512 * 1024', async () => {
        expect(await strategy.isRecommendationReached({
          client: nodeClient,
          databaseId: mockDatabaseId,
          keys: [mockBigStringInfo, mockHashInfo],
        })).toEqual({ isReached: true, params: { keys: [mockBigStringInfo.name] } });
      });
    });
  });
});
