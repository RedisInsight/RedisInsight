import { when } from 'jest-when';
import IORedis from 'ioredis';
import { RedisVersionStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockRedisServerResponse1: string = '# Server\r\nredis_version:6.0.0\r\n';
const mockRedisServerResponse2: string = '# Server\r\nredis_version:5.1.1\r\n';

describe('RedisVersionStrategy', () => {
  let strategy: RedisVersionStrategy;

  beforeEach(() => {
    strategy = new RedisVersionStrategy();
  });

  describe('isRecommendationReached', () => {
    describe('with search module', () => {
      it('should return false when version not less then 6', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'info' }))
          .mockResolvedValue(mockRedisServerResponse1);

        expect(await strategy.isRecommendationReached(nodeClient)).toEqual(false);
      });

      it('should return true when version less then 6', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'info' }))
          .mockResolvedValue(mockRedisServerResponse2);

        expect(await strategy.isRecommendationReached(nodeClient)).toEqual(true);
      });

      it('should return false when INFO return error', async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'info' }))
          .mockRejectedValue('some error');

        expect(await strategy.isRecommendationReached(nodeClient)).toEqual(false);
      });
    });
  });
});
