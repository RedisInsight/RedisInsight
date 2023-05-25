import IORedis from 'ioredis';
import { RedisVersionStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

describe('RedisVersionStrategy', () => {
  let strategy: RedisVersionStrategy;

  beforeEach(() => {
    strategy = new RedisVersionStrategy();
  });

  describe('isRecommendationReached', () => {
    describe('with search module', () => {
      it('should return false when version not less then 6', async () => {
        expect(await strategy.isRecommendationReached({ version: '6.0.0' })).toEqual({ isReached: false });
      });

      it('should return true when version less then 6', async () => {
        expect(await strategy.isRecommendationReached({ version: '5.1.1' })).toEqual({ isReached: true });
      });
    });
  });
});
