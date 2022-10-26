import { when } from 'jest-when';
import IORedis from 'ioredis';
import { JsonInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/json-info.strategy';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockKey = Buffer.from('key');

describe('JsonInfoStrategy', () => {
  const strategy = new JsonInfoStrategy();

  beforeEach(async () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'json.objlen' }))
      .mockResolvedValue(1)
      .calledWith(jasmine.objectContaining({ name: 'json.arrlen' }))
      .mockResolvedValue(2)
      .calledWith(jasmine.objectContaining({ name: 'json.strlen' }))
      .mockResolvedValue(3);
  });

  describe('getLength', () => {
    it('should get length (object)', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'json.type' }))
        .mockResolvedValue('object');

      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(1);
    });
    it('should get length (array)', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'json.type' }))
        .mockResolvedValue('array');

      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(2);
    });
    it('should get length (string)', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'json.type' }))
        .mockResolvedValue('string');

      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(3);
    });
    it('should get length (undefined)', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'json.type' }))
        .mockResolvedValue('undefined');

      expect(await strategy.getLength(nodeClient, mockKey)).toEqual(null);
    });
  });
});
