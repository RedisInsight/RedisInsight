import { when } from 'jest-when';
import IORedis from 'ioredis';
import { AvoidLuaScriptsStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockRedisMemoryResponse1: string = '# Memory\r\nnumber_of_cached_scripts:1\r\n';
const mockRedisMemoryResponse2: string = '# Memory\r\nnumber_of_cached_scripts:11\r\n';

describe('AvoidLuaScriptsStrategy', () => {
  let strategy: AvoidLuaScriptsStrategy;

  beforeEach(() => {
    strategy = new AvoidLuaScriptsStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when number_of_cached_scripts less then 10', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisMemoryResponse1);

      expect(await strategy.isRecommendationReached(nodeClient)).toEqual({ isReached: false });
    });

    it('should return true when number_of_cached_scripts more then 10', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisMemoryResponse2);

      expect(await strategy.isRecommendationReached(nodeClient)).toEqual({ isReached: true });
    });
  });
});
