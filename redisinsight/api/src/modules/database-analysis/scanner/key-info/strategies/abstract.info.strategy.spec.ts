import { when } from 'jest-when';
import IORedis from 'ioredis';
import { HashInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/hash-info.strategy';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('AbstractInfoStrategy', () => {
  const strategy = new HashInfoStrategy();

  beforeEach(async () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'hlen' }))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLengthSafe', () => {
    it('should get length', async () => {
      expect(await strategy.getLengthSafe(nodeClient, mockKey)).toEqual(mockRedisResponse);
    });
    it('should return null in case of error', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'hlen' }))
        .mockRejectedValueOnce(new Error('some error'));

      expect(await strategy.getLengthSafe(nodeClient, mockKey)).toEqual(null);
    });
  });
});
