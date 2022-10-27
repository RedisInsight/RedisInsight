import { when } from 'jest-when';
import IORedis from 'ioredis';
import { ListInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/list-info.strategy';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('ListInfoStrategy', () => {
  const strategy = new ListInfoStrategy();

  beforeEach(async () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'llen' }))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(mockRedisResponse);
    });
  });
});
