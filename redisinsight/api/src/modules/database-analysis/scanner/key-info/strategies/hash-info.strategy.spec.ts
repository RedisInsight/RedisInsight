import { when } from 'jest-when';
import IORedis from 'ioredis';
import { HashInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/hash-info.strategy';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('HashInfoStrategy', () => {
  const strategy = new HashInfoStrategy();

  beforeEach(async () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'hlen' }))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should scan standalone database', async () => {
      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(mockRedisResponse);
    });
  });
});
