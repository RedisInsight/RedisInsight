import { when } from 'jest-when';
import IORedis from 'ioredis';
import { StringInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/string-info.strategy';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('StringInfoStrategy', () => {
  const strategy = new StringInfoStrategy();

  beforeEach(async () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'strlen' }))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(mockRedisResponse);
    });
  });
});
