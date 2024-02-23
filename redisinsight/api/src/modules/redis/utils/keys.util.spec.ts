import { getTotalKeys } from 'src/modules/redis/utils/keys.util';
import {
  mockRedisKeyspaceInfoResponse,
  mockRedisKeyspaceInfoResponseNoKeyspaceData,
  mockStandaloneRedisClient,
} from 'src/__mocks__';

describe('getTotalKeys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should return total from dbsize', async () => {
    mockStandaloneRedisClient.sendCommand.mockResolvedValue('1');
    expect(await getTotalKeys(mockStandaloneRedisClient)).toEqual(1);
    expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledTimes(1);
    expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledWith(['dbsize'], { replyEncoding: 'utf8' });
  });

  it('Should return total from info (when dbsize returned error)', async () => {
    mockStandaloneRedisClient.sendCommand.mockRejectedValueOnce(new Error('some error'));
    mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce(mockRedisKeyspaceInfoResponse);
    expect(await getTotalKeys(mockStandaloneRedisClient)).toEqual(1);
    expect(mockStandaloneRedisClient.sendCommand).toHaveBeenCalledTimes(2);
    expect(mockStandaloneRedisClient.sendCommand).toHaveBeenNthCalledWith(1, ['dbsize'], { replyEncoding: 'utf8' });
    expect(mockStandaloneRedisClient.sendCommand)
      .toHaveBeenNthCalledWith(2, ['info', 'keyspace'], { replyEncoding: 'utf8' });
  });
  it('Should return 0 since info keyspace hasn\'t keys values', async () => {
    mockStandaloneRedisClient.sendCommand.mockRejectedValueOnce(new Error('some error'));
    mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce(mockRedisKeyspaceInfoResponseNoKeyspaceData);
    expect(await getTotalKeys(mockStandaloneRedisClient)).toEqual(0);
  });
  it('Should return 0 since info returned empty string', async () => {
    mockStandaloneRedisClient.sendCommand.mockRejectedValueOnce(new Error('some error'));
    mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce('');
    expect(await getTotalKeys(mockStandaloneRedisClient)).toEqual(0);
  });
  it('Should return -1 when dbsize and info returned error', async () => {
    mockStandaloneRedisClient.sendCommand.mockRejectedValue(new Error('some error'));
    expect(await getTotalKeys(mockStandaloneRedisClient)).toEqual(-1);
  });
});
