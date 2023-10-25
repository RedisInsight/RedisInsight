export const mockDbSizeKeysCount = 10_000;

export const mockInfoKeysCount = 20_000;

export const mockRedisKeysUtil = {
  __esModule: true,
  getTotalKeysFromInfo: jest.fn().mockResolvedValue(mockInfoKeysCount),
  getTotalKeysFromDBSize: jest.fn().mockResolvedValue(mockDbSizeKeysCount),
  getTotalKeys: jest.fn().mockResolvedValue(mockDbSizeKeysCount),
};

export const mockRedisKeysUtilModule = () => mockRedisKeysUtil;
