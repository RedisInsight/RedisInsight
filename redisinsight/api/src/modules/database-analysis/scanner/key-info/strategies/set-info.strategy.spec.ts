import { when } from 'jest-when';
import IORedis from 'ioredis';
import { SetInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/set-info.strategy';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('SetInfoStrategy', () => {
  const strategy = new SetInfoStrategy();

  beforeEach(async () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'scard' }))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(mockRedisResponse);
    });
  });
});
