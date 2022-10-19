import { when } from 'jest-when';
import IORedis from 'ioredis';
import { ZSetInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/z-set-info.strategy';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('ZSetInfoStrategy', () => {
  const strategy = new ZSetInfoStrategy();

  beforeEach(async () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'zcard' }))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(mockRedisResponse);
    });
  });
});
