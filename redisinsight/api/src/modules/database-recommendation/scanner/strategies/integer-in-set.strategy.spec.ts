import IORedis from 'ioredis';
import { IntegersInSetStrategy } from 'src/modules/database-recommendation/scanner/strategies';
import { RedisString } from 'src/common/constants';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockDatabaseId = 'id';

const mockKeyName = 'name';

const mockNotIntegerMembers: RedisString[] = ['a'].map((val) => Buffer.from(val));
const mockIntegerMembers: RedisString[] = [
  '0',
  '1',
  '1.1',
  '0.999999',
  '123123123123',
  '6854785734',
].map((val) => Buffer.from(val));

describe('IntegersInSetStrategy', () => {
  let strategy: IntegersInSetStrategy;

  beforeEach(async () => {
    strategy = new IntegersInSetStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when all members is an integer', async () => {
      expect(await strategy.isRecommendationReached({
        client: nodeClient,
        databaseId: mockDatabaseId,
        members: [...mockIntegerMembers],
        keyName: mockKeyName,
      })).toEqual({ isReached: false });
    });

    it('should return false when some member is not an integer in the first 50 members and not all members are uniq', async () => {
      expect(await strategy.isRecommendationReached({
        client: nodeClient,
        databaseId: mockDatabaseId,
        members: [...mockIntegerMembers, ...mockNotIntegerMembers, ...mockNotIntegerMembers] as RedisString[],
        keyName: mockKeyName,
      })).toEqual({ isReached: false });
    });

    it('should return false when 51th member is not an integer', async () => {
      expect(await strategy.isRecommendationReached({
        client: nodeClient,
        databaseId: mockDatabaseId,
        members: [...Array.from({ length: 50 }).fill(mockIntegerMembers[0]), ...mockNotIntegerMembers] as RedisString[],
        keyName: mockKeyName,
      })).toEqual({ isReached: false });
    });

    it('should return true when some member is not an integer in the first 50 members and all members are uniq', async () => {
      expect(await strategy.isRecommendationReached({
        client: nodeClient,
        databaseId: mockDatabaseId,
        members: [...mockIntegerMembers, ...mockNotIntegerMembers] as RedisString[],
        keyName: mockKeyName,
      })).toEqual({ isReached: true, params: { keys: [mockKeyName] } });
    });
  });
});
