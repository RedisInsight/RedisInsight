import { when } from 'jest-when';
import IORedis from 'ioredis';
import { GraphInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/graph-info.strategy';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockKey = Buffer.from('key');
const mockRedisResponse = [
  [[1, 'count(r)']],
  [[[3, 999]]],
  [
    'Cached execution: 1',
    'Query internal execution time: 0.093200 milliseconds',
  ],
];

describe('GraphInfoStrategy', () => {
  const strategy = new GraphInfoStrategy();

  beforeEach(async () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'graph.query' }))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(999);
    });
  });
});
