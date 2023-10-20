import IORedis from 'ioredis';
import { when } from 'jest-when';
import { getTotal } from 'src/modules/database/utils/database.total.util';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockRedisKeyspaceInfoResponse: string = '# Keyspace\r\ndb0:keys=2,expires=0,avg_ttl=0\r\n';
const mockRedisKeyspaceInfoResponseNoKeyspaceData: string = '# Keyspace\r\n \r\n';

describe('getTotalFromInfo', () => {
  it('Should return total from dbsize', () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'dbsize' }))
      .mockResolvedValue('1');
    return getTotal(nodeClient).then((total) => {
      expect(total).toBe(1);
    });
  });

  it('Should return total from info when dbsize execute with error', () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'dbsize' }))
      .mockRejectedValue('some error');
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'info' }))
      .mockResolvedValue(mockRedisKeyspaceInfoResponse);
    return getTotal(nodeClient).then((total) => {
      expect(total).toBe(2);
    });
  });

  it('Should return 0', () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'dbsize' }))
      .mockRejectedValue('some error');
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'info' }))
      .mockResolvedValue(mockRedisKeyspaceInfoResponseNoKeyspaceData);
    return getTotal(nodeClient).then((total) => {
      expect(total).toBe(0);
    });
  });

  it('Should return -1 when dbsize and info execute with errors', () => {
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'dbsize' }))
      .mockRejectedValue('some error');
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'info' }))
      .mockRejectedValue('some error');
    return getTotal(nodeClient).then((total) => {
      expect(total).toBe(-1);
    });
  });
});
