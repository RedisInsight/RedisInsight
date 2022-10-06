import { when } from 'jest-when';
import IORedis from 'ioredis';
import { TsInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/ts-info.strategy';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockKey = Buffer.from('key');
const mockRedisResponse = [
  'totalSamples',
  10,
  'memoryUsage',
  4239,
  'firstTimestamp',
  0,
  'lastTimestamp',
  0,
  'retentionTime',
  6000,
  'chunkCount',
  1,
  'chunkSize',
  4096,
];

describe('TsInfoStrategy', () => {
  const strategy = new TsInfoStrategy();

  beforeEach(async () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'ts.info' }))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(10);
    });
  });
});
