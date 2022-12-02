import IORedis from 'ioredis';
import { when } from 'jest-when';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { RecommendationProvider } from 'src/modules/recommendation/providers/recommendation.provider';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.isCluster = false;
nodeClient.sendCommand = jest.fn();

const mockRedisMemoryInfoResponse_1: string = '# Memory\r\nnumber_of_cached_scripts:10\r\n';
const mockRedisMemoryInfoResponse_2: string = '# Memory\r\nnumber_of_cached_scripts:11\r\n';

const mockRedisKeyspaceInfoResponse_1: string = '# Keyspace\r\ndb0:keys=2,expires=0,avg_ttl=0\r\n';
const mockRedisKeyspaceInfoResponse_2: string = `# Keyspace\r\ndb0:keys=2,expires=0,avg_ttl=0\r\n
  db1:keys=0,expires=0,avg_ttl=0\r\n`;
const mockRedisKeyspaceInfoResponse_3: string = `# Keyspace\r\ndb0:keys=2,expires=0,avg_ttl=0\r\n
  db2:keys=20,expires=0,avg_ttl=0\r\n`;

const mockRedisConfigResponse = ['name', '512'];

const mockKeys = [
  {
    name: Buffer.from('name'), type: 'string', length: 10, memory: 10, ttl: -1,
  },
  {
    name: Buffer.from('name'), type: 'hash', length: 10, memory: 10, ttl: -1,
  },
  {
    name: Buffer.from('name'), type: 'stream', length: 10, memory: 10, ttl: -1,
  },
  {
    name: Buffer.from('name'), type: 'set', length: 10, memory: 10, ttl: -1,
  },
  {
    name: Buffer.from('name'), type: 'zset', length: 10, memory: 10, ttl: -1,
  },
  {
    name: Buffer.from('name'), type: 'ReJSON-RL', length: 10, memory: 10, ttl: -1,
  },
  {
    name: Buffer.from('name'), type: 'graphdata', length: 10, memory: 10, ttl: -1,
  },
  {
    name: Buffer.from('name'), type: 'TSDB-TYPE', length: 10, memory: 10, ttl: -1,
  },
];

const mockBigHashKey = {
  name: Buffer.from('name'), type: 'hash', length: 5001, memory: 10, ttl: -1,
};

const mockBigHashKey_2 = {
  name: Buffer.from('name'), type: 'hash', length: 1001, memory: 10, ttl: -1,
};

const mockBigHashKey_3 = {
  name: Buffer.from('name'), type: 'hash', length: 513, memory: 10, ttl: -1,
};

const mockBigStringKey = {
  name: Buffer.from('name'), type: 'string', length: 10, memory: 201, ttl: -1,
};

const mockBigSet = {
  name: Buffer.from('name'), type: 'set', length: 513, memory: 10, ttl: -1,
};

const mockBigListKey = {
  name: Buffer.from('name'), type: 'list', length: 1001, memory: 10, ttl: -1,
};

describe('RecommendationProvider', () => {
  const service = new RecommendationProvider();

  describe('determineLuaScriptRecommendation', () => {
    it('should not return luaScript recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisMemoryInfoResponse_1);

      const luaScriptRecommendation = await service.determineLuaScriptRecommendation(nodeClient);
      expect(luaScriptRecommendation).toEqual(null);
    });

    it('should return luaScript recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisMemoryInfoResponse_2);

      const luaScriptRecommendation = await service.determineLuaScriptRecommendation(nodeClient);
      expect(luaScriptRecommendation).toEqual({ name: RECOMMENDATION_NAMES.LUA_SCRIPT });
    });

    it('should not return luaScript recommendation when info command executed with error', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockRejectedValue('some error');

      const luaScriptRecommendation = await service.determineLuaScriptRecommendation(nodeClient);
      expect(luaScriptRecommendation).toEqual(null);
    });
  });

  describe('determineBigHashesRecommendation', () => {
    it('should not return bigHashes recommendation', async () => {
      const bigHashesRecommendation = await service.determineBigHashesRecommendation(mockKeys);
      expect(bigHashesRecommendation).toEqual(null);
    });
    it('should return bigHashes recommendation', async () => {
      const bigHashesRecommendation = await service.determineBigHashesRecommendation(
        [...mockKeys, mockBigHashKey],
      );
      expect(bigHashesRecommendation).toEqual({ name: RECOMMENDATION_NAMES.BIG_HASHES });
    });
  });

  describe('determineBigTotalRecommendation', () => {
    it('should not return useSmallerKeys recommendation', async () => {
      const bigTotalRecommendation = await service.determineBigTotalRecommendation(1);
      expect(bigTotalRecommendation).toEqual(null);
    });
    it('should return useSmallerKeys recommendation', async () => {
      const bigTotalRecommendation = await service.determineBigTotalRecommendation(1_000_001);
      expect(bigTotalRecommendation).toEqual({ name: RECOMMENDATION_NAMES.USE_SMALLER_KEYS });
    });
  });

  describe('determineLogicalDatabasesRecommendation', () => {
    it('should not return avoidLogicalDatabases recommendation when only one logical db', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_1);

      const avoidLogicalDatabasesRecommendation = await service.determineLogicalDatabasesRecommendation(nodeClient);
      expect(avoidLogicalDatabasesRecommendation).toEqual(null);
    });

    it('should not return avoidLogicalDatabases recommendation when only on logical db with keys', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_2);

      const avoidLogicalDatabasesRecommendation = await service.determineLogicalDatabasesRecommendation(nodeClient);
      expect(avoidLogicalDatabasesRecommendation).toEqual(null);
    });

    it('should return avoidLogicalDatabases recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_3);

      const avoidLogicalDatabasesRecommendation = await service.determineLogicalDatabasesRecommendation(nodeClient);
      expect(avoidLogicalDatabasesRecommendation).toEqual({ name: 'avoidLogicalDatabases' });
    });

    it('should not return avoidLogicalDatabases recommendation when info command executed with error', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockRejectedValue('some error');

      const avoidLogicalDatabasesRecommendation = await service.determineLogicalDatabasesRecommendation(nodeClient);
      expect(avoidLogicalDatabasesRecommendation).toEqual(null);
    });

    it('should not return avoidLogicalDatabases recommendation when isCluster', async () => {
      nodeClient.isCluster = true;
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisKeyspaceInfoResponse_3);

      const avoidLogicalDatabasesRecommendation = await service.determineLogicalDatabasesRecommendation(nodeClient);
      expect(avoidLogicalDatabasesRecommendation).toEqual(null);
      nodeClient.isCluster = false;
    });
  });

  describe('determineCombineSmallStringsToHashesRecommendation', () => {
    it('should not return combineSmallStringsToHashes recommendation', async () => {
      const smallStringRecommendation = await service.determineCombineSmallStringsToHashesRecommendation([
        mockBigStringKey,
      ]);
      expect(smallStringRecommendation).toEqual(null);
    });
    it('should return combineSmallStringsToHashes recommendation', async () => {
      const smallStringRecommendation = await service.determineCombineSmallStringsToHashesRecommendation(mockKeys);
      expect(smallStringRecommendation).toEqual({ name: RECOMMENDATION_NAMES.COMBINE_SMALL_STRINGS_TO_HASHES });
    });
  });

  describe('determineIncreaseSetMaxIntsetEntriesRecommendation', () => {
    it('should not return increaseSetMaxIntsetEntries', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'config' }))
        .mockResolvedValue(mockRedisConfigResponse);

      const increaseSetMaxIntsetEntriesRecommendation = await service
        .determineIncreaseSetMaxIntsetEntriesRecommendation(nodeClient, mockKeys);
      expect(increaseSetMaxIntsetEntriesRecommendation).toEqual(null);
    });

    it('should return increaseSetMaxIntsetEntries recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'config' }))
        .mockResolvedValue(mockRedisConfigResponse);

      const increaseSetMaxIntsetEntriesRecommendation = await service
        .determineIncreaseSetMaxIntsetEntriesRecommendation(nodeClient, [...mockKeys, mockBigSet]);
      expect(increaseSetMaxIntsetEntriesRecommendation)
        .toEqual({ name: RECOMMENDATION_NAMES.INCREASE_SET_MAX_INTSET_ENTRIES });
    });

    it('should not return increaseSetMaxIntsetEntries recommendation when config command executed with error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'config' }))
          .mockRejectedValue('some error');

        const increaseSetMaxIntsetEntriesRecommendation = await service
          .determineIncreaseSetMaxIntsetEntriesRecommendation(nodeClient, mockKeys);
        expect(increaseSetMaxIntsetEntriesRecommendation).toEqual(null);
      });
  });

  describe('determineConvertHashtableToZiplistRecommendation', () => {
    it('should not return convertHashtableToZiplist recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'config' }))
        .mockResolvedValue(mockRedisConfigResponse);

      const convertHashtableToZiplistRecommendation = await service
        .determineConvertHashtableToZiplistRecommendation(nodeClient, mockKeys);
      expect(convertHashtableToZiplistRecommendation).toEqual(null);
    });

    it('should return convertHashtableToZiplist recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'config' }))
        .mockResolvedValue(mockRedisConfigResponse);

      const convertHashtableToZiplistRecommendation = await service
        .determineConvertHashtableToZiplistRecommendation(nodeClient, [...mockKeys, mockBigHashKey_3]);
      expect(convertHashtableToZiplistRecommendation)
        .toEqual({ name: RECOMMENDATION_NAMES.CONVERT_HASHTABLE_TO_ZIPLIST });
    });

    it('should not return convertHashtableToZiplist recommendation when config command executed with error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'config' }))
          .mockRejectedValue('some error');

        const convertHashtableToZiplistRecommendation = await service
          .determineConvertHashtableToZiplistRecommendation(nodeClient, mockKeys);
        expect(convertHashtableToZiplistRecommendation).toEqual(null);
      });
  });

  describe('determineCompressHashFieldNamesRecommendation', () => {
    it('should not return compressHashFieldNames recommendation', async () => {
      const compressHashFieldNamesRecommendation = await service
        .determineCompressHashFieldNamesRecommendation(mockKeys);
      expect(compressHashFieldNamesRecommendation).toEqual(null);
    });
    it('should return compressHashFieldNames recommendation', async () => {
      const compressHashFieldNamesRecommendation = await service
        .determineCompressHashFieldNamesRecommendation([mockBigHashKey_2]);
      expect(compressHashFieldNamesRecommendation).toEqual({ name: RECOMMENDATION_NAMES.COMPRESS_HASH_FIELD_NAMES });
    });
  });

  describe('determineCompressionForListRecommendation', () => {
    it('should not return compressionForList recommendation', async () => {
      const compressHashFieldNamesRecommendation = await service
        .determineCompressionForListRecommendation(mockKeys);
      expect(compressHashFieldNamesRecommendation).toEqual(null);
    });
    it('should return compressionForList recommendation', async () => {
      const compressHashFieldNamesRecommendation = await service
        .determineCompressionForListRecommendation([mockBigListKey]);
      expect(compressHashFieldNamesRecommendation).toEqual({ name: RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST });
    });
  });
});
