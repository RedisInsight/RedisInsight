import IORedis from 'ioredis';
import { when, resetAllWhenMocks } from 'jest-when';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { mockRedisNoAuthError, mockRedisNoPasswordError } from 'src/__mocks__';
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

const mockRedisClientsResponse_1: string = '# Clients\r\nconnected_clients:100\r\n';
const mockRedisClientsResponse_2: string = '# Clients\r\nconnected_clients:101\r\n';

const mockRedisServerResponse_1: string = '# Server\r\nredis_version:6.0.0\r\n';
const mockRedisServerResponse_2: string = '# Server\r\nredis_version:5.1.1\r\n';

const mockRedisAclListResponse_1: string[] = [
  'user <pass off resetchannels -@all',
  'user default on #d74ff0ee8da3b9806b18c877dbf29bbde50b5bd8e4dad7a3a725000feb82e8f1 ~* &* +@all',
];
const mockRedisAclListResponse_2: string[] = [
  ...mockRedisAclListResponse_1,
  'user test_2 on nopass ~* &* +@all',
];

const mockFTListResponse_1 = [];
const mockFTListResponse_2 = ['idx'];

const generateRTSRecommendationTests = [
  { input: ['0', ['123', 123]], expected: null },
  { input: ['0', ['1234567891', 3]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['1234567891', 1234567891]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['123', 1234567891]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['123', 12345678911]], expected: null },
  { input: ['0', ['123', 1234567891234]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['123', 12345678912345]], expected: null },
  { input: ['0', ['123', 1234567891234567]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['12345678912345678', 1]], expected: null },
  { input: ['0', ['1234567891234567891', 1]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['1', 1234567891.2]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['1234567891.2', 1]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['1234567891:12', 1]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['1234567891a12', 1]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['1234567891.2.2', 1]], expected: null },
  { input: ['0', ['1234567891asd', 1]], expected: null },
  { input: ['0', ['10-10-2020', 1]], expected: { name: RECOMMENDATION_NAMES.RTS, params: { keys: [Buffer.from('name')] } } },
  { input: ['0', ['', 1]], expected: null },
  { input: ['0', ['1', -12]], expected: null },
  { input: ['0', ['1', -1234567891]], expected: null },
  { input: ['0', ['1', -1234567891.123]], expected: null },
  { input: ['0', ['1', -1234567891.123]], expected: null },
  { input: ['0', ['1234567891.-123', 1]], expected: null },
];

const mockZScanResponse_1 = [
  '0',
  ['1', 1, '12345678910', 12345678910],
];
const mockZScanResponse_2 = [
  '0',
  ['12345678910', 12345678910, 1, 1],
];

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

const mockBigHashKey_3 = {
  name: Buffer.from('name'), type: 'hash', length: 513, memory: 10, ttl: -1,
};

const mockBigStringKey = {
  name: Buffer.from('name'), type: 'string', length: 10, memory: 201, ttl: -1,
};

const mockHugeStringKey = {
  name: Buffer.from('name'), type: 'string', length: 10, memory: 1_000_001, ttl: -1,
};

const mockHugeStringKey1 = {
  name: Buffer.from('name'), type: 'string', length: 10, memory: 512 * 1024 + 1, ttl: -1,
};

const mockBigSet = {
  name: Buffer.from('name'), type: 'set', length: 513, memory: 10, ttl: -1,
};

const mockHugeSet = {
  name: Buffer.from('name'), type: 'set', length: 100_001, memory: 10, ttl: -1,
};

const mockBigZSetKey = {
  name: Buffer.from('name'), type: 'zset', length: 513, memory: 10, ttl: -1,
};

const mockBigListKey = {
  name: Buffer.from('name'), type: 'list', length: 1001, memory: 10, ttl: -1,
};

const mockSortedSets = new Array(101).fill(
  {
    name: Buffer.from('name'), type: 'zset', length: 10, memory: 10, ttl: -1,
  },
);

const mockSmallStringKey = {
  name: Buffer.from('name'), type: 'string', length: 10, memory: 199, ttl: -1,
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
      expect(bigHashesRecommendation)
        .toEqual({ name: RECOMMENDATION_NAMES.BIG_HASHES, params: { keys: [mockBigHashKey.name] } });
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
      const smallStringRecommendation = await service.determineCombineSmallStringsToHashesRecommendation(
        new Array(49).fill(mockSmallStringKey)
        );
      expect(smallStringRecommendation).toEqual(null);
    });
    it('should not return combineSmallStringsToHashes recommendation when strings are big', async () => {
      const smallStringRecommendation = await service.determineCombineSmallStringsToHashesRecommendation(
        new Array(50).fill(mockBigStringKey)
        );
      expect(smallStringRecommendation).toEqual(null);
    });
    it('should return combineSmallStringsToHashes recommendation', async () => {
      const smallStringRecommendation = await service.determineCombineSmallStringsToHashesRecommendation(new Array(50).fill(mockSmallStringKey));
      expect(smallStringRecommendation)
        .toEqual({
          name: RECOMMENDATION_NAMES.COMBINE_SMALL_STRINGS_TO_HASHES,
          params: { keys: [Buffer.from('name')] },
        });
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
        .toEqual({
          name: RECOMMENDATION_NAMES.INCREASE_SET_MAX_INTSET_ENTRIES,
          params: { keys: [mockBigSet.name] },
        });
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

  describe('determineHashHashtableToZiplistRecommendation', () => {
    it('should not return hashHashtableToZiplist recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'config' }))
        .mockResolvedValue(mockRedisConfigResponse);

      const convertHashtableToZiplistRecommendation = await service
        .determineHashHashtableToZiplistRecommendation(nodeClient, mockKeys);
      expect(convertHashtableToZiplistRecommendation).toEqual(null);
    });

    it('should return hashHashtableToZiplist recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'config' }))
        .mockResolvedValue(mockRedisConfigResponse);

      const convertHashtableToZiplistRecommendation = await service
        .determineHashHashtableToZiplistRecommendation(nodeClient, [...mockKeys, mockBigHashKey_3]);
      expect(convertHashtableToZiplistRecommendation)
        .toEqual(
          {
            name: RECOMMENDATION_NAMES.HASH_HASHTABLE_TO_ZIPLIST,
            params: { keys: [mockBigHashKey_3.name] },
          },
        );
    });

    it('should not return hashHashtableToZiplist recommendation when config command executed with error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'config' }))
          .mockRejectedValue('some error');

        const convertHashtableToZiplistRecommendation = await service
          .determineHashHashtableToZiplistRecommendation(nodeClient, mockKeys);
        expect(convertHashtableToZiplistRecommendation).toEqual(null);
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
      expect(compressHashFieldNamesRecommendation)
        .toEqual({
          name: RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST,
          params: { keys: [mockBigListKey.name] },
        });
    });
  });

  describe('determineBigStringsRecommendation', () => {
    it('should not return bigStrings recommendation', async () => {
      const bigStringsRecommendation = await service
        .determineBigStringsRecommendation(mockKeys);
      expect(bigStringsRecommendation).toEqual(null);
    });
    it('should return bigStrings recommendation', async () => {
      const bigStringsRecommendation = await service
        .determineBigStringsRecommendation([mockHugeStringKey]);
      expect(bigStringsRecommendation)
        .toEqual({
          name: RECOMMENDATION_NAMES.BIG_STRINGS,
          params: { keys: [mockHugeStringKey.name] },
        });
    });
  });

  describe('determineZSetHashtableToZiplistRecommendation', () => {
    it('should not return zSetHashtableToZiplist recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'config' }))
        .mockResolvedValue(mockRedisConfigResponse);

      const zSetHashtableToZiplistRecommendation = await service
        .determineZSetHashtableToZiplistRecommendation(nodeClient, mockKeys);
      expect(zSetHashtableToZiplistRecommendation).toEqual(null);
    });

    it('should return zSetHashtableToZiplist recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'config' }))
        .mockResolvedValue(mockRedisConfigResponse);

      const zSetHashtableToZiplistRecommendation = await service
        .determineZSetHashtableToZiplistRecommendation(nodeClient, [...mockKeys, mockBigZSetKey]);
      expect(zSetHashtableToZiplistRecommendation)
        .toEqual({
          name: RECOMMENDATION_NAMES.ZSET_HASHTABLE_TO_ZIPLIST,
          params: { keys: [mockBigZSetKey.name] },
        });
    });

    it('should not return zSetHashtableToZiplist recommendation when config command executed with error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'config' }))
          .mockRejectedValue('some error');

        const zSetHashtableToZiplistRecommendation = await service
          .determineZSetHashtableToZiplistRecommendation(nodeClient, mockKeys);
        expect(zSetHashtableToZiplistRecommendation).toEqual(null);
      });
  });

  describe('determineBigSetsRecommendation', () => {
    it('should not return bigSets recommendation', async () => {
      const bigSetsRecommendation = await service
        .determineBigSetsRecommendation(mockKeys);
      expect(bigSetsRecommendation).toEqual(null);
    });
    it('should return bigSets recommendation', async () => {
      const bigSetsRecommendation = await service
        .determineBigSetsRecommendation([mockHugeSet]);
      expect(bigSetsRecommendation)
        .toEqual({
          name: RECOMMENDATION_NAMES.BIG_SETS,
          params: { keys: [mockHugeSet.name] },
        });
    });
  });

  describe('determineConnectionClientsRecommendation', () => {
    it('should not return connectionClients recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisClientsResponse_1);

      const connectionClientsRecommendation = await service
        .determineConnectionClientsRecommendation(nodeClient);
      expect(connectionClientsRecommendation).toEqual(null);
    });

    it('should return connectionClients recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisClientsResponse_2);

      const connectionClientsRecommendation = await service
        .determineConnectionClientsRecommendation(nodeClient);
      expect(connectionClientsRecommendation)
        .toEqual({ name: RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS });
    });

    it('should not return connectionClients recommendation when info command executed with error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'info' }))
          .mockRejectedValue('some error');

        const connectionClientsRecommendation = await service
          .determineConnectionClientsRecommendation(nodeClient);
        expect(connectionClientsRecommendation).toEqual(null);
      });
  });

  describe('determineSetPasswordRecommendation', () => {
    it('should not return setPassword recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'acl' }))
        .mockResolvedValue(mockRedisAclListResponse_1);

      const setPasswordRecommendation = await service
        .determineSetPasswordRecommendation(nodeClient);
      expect(setPasswordRecommendation).toEqual(null);
    });

    it('should return setPassword recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'acl' }))
        .mockResolvedValue(mockRedisAclListResponse_2);

      const setPasswordRecommendation = await service
        .determineSetPasswordRecommendation(nodeClient);
      expect(setPasswordRecommendation).toEqual({ name: RECOMMENDATION_NAMES.SET_PASSWORD });
    });

    it('should not return setPassword recommendation when acl command executed with error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'acl' }))
          .mockRejectedValue('some error');

        const setPasswordRecommendation = await service
          .determineSetPasswordRecommendation(nodeClient);
        expect(setPasswordRecommendation).toEqual(null);
      });

    it('should not return setPassword recommendation when acl command executed with error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'auth' }))
          .mockRejectedValue(mockRedisNoAuthError);

        const setPasswordRecommendation = await service
          .determineSetPasswordRecommendation(nodeClient);
        expect(setPasswordRecommendation).toEqual(null);
      });

    it('should return setPassword recommendation when acl command executed with no password error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'auth' }))
          .mockRejectedValue(mockRedisNoPasswordError);

        const setPasswordRecommendation = await service
          .determineSetPasswordRecommendation(nodeClient);
        expect(setPasswordRecommendation).toEqual({ name: RECOMMENDATION_NAMES.SET_PASSWORD });
      });
  });

  describe('determineRTSRecommendation', () => {
    test.each(generateRTSRecommendationTests)('%j', async ({ input, expected }) => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'zscan' }))
        .mockResolvedValue(input);

      const RTSRecommendation = await service
        .determineRTSRecommendation(nodeClient, mockKeys);
      expect(RTSRecommendation).toEqual(expected);
    });

    it('should not return RTS recommendation when only 101 sorted set contain timestamp', async () => {
      let counter = 0;
      while (counter <= 100) {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'zscan' }))
          .mockResolvedValueOnce(mockZScanResponse_1);
        counter += 1;
      }

      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'zscan' }))
        .mockResolvedValueOnce(mockZScanResponse_2);

      const RTSRecommendation = await service
        .determineRTSRecommendation(nodeClient, mockSortedSets);
      expect(RTSRecommendation).toEqual(null);
    });

    it('should not return RTS recommendation when zscan command executed with error',
      async () => {
        resetAllWhenMocks();
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'zscan' }))
          .mockRejectedValue('some error');

        const RTSRecommendation = await service
          .determineRTSRecommendation(nodeClient, mockKeys);
        expect(RTSRecommendation).toEqual(null);
      });
  });

  describe('determineRedisVersionRecommendation', () => {
    it('should not return redis version recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValue(mockRedisServerResponse_1);

      const redisVersionRecommendation = await service
        .determineRedisVersionRecommendation(nodeClient);
      expect(redisVersionRecommendation).toEqual(null);
    });

    it('should return redis version recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValueOnce(mockRedisServerResponse_2);

      const redisVersionRecommendation = await service
        .determineRedisVersionRecommendation(nodeClient);
      expect(redisVersionRecommendation).toEqual({ name: RECOMMENDATION_NAMES.REDIS_VERSION });
    });

    it('should not return redis version recommendation when info command executed with error',
      async () => {
        resetAllWhenMocks();
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'info' }))
          .mockRejectedValue('some error');

        const redisVersionRecommendation = await service
          .determineRedisVersionRecommendation(nodeClient);
        expect(redisVersionRecommendation).toEqual(null);
      });
  });

  describe('determineSearchJSONRecommendation', () => {
    it('should not return searchJSON', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
        .mockResolvedValue(mockFTListResponse_2);

      const searchJSONRecommendation = await service
        .determineSearchJSONRecommendation(nodeClient, mockKeys);
      expect(searchJSONRecommendation).toEqual(null);
    });

    it('should return searchJSON recommendation', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
        .mockResolvedValue(mockFTListResponse_1);

      const searchJSONRecommendation = await service
        .determineSearchJSONRecommendation(nodeClient, mockKeys);
      expect(searchJSONRecommendation)
        .toEqual({
          name: RECOMMENDATION_NAMES.SEARCH_JSON,
          params: { keys: [Buffer.from('name')] },
        });
    });

    it('should return not searchJSON recommendation when there is no JSON key', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
        .mockResolvedValue(mockFTListResponse_1);

      const searchJSONRecommendation = await service
        .determineSearchJSONRecommendation(nodeClient, [mockBigSet]);
      expect(searchJSONRecommendation)
        .toEqual(null);
    });

    it('should return searchJSON recommendation when command executed with error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
          .mockRejectedValue('some error');

        const searchJSONRecommendation = await service
          .determineSearchJSONRecommendation(nodeClient, mockKeys);
        expect(searchJSONRecommendation)
          .toEqual({
            name: RECOMMENDATION_NAMES.SEARCH_JSON,
            params: { keys: [Buffer.from('name')] },
          });
      });
  });

  describe('determineSearchStringRecommendation', () => {
    it('should not return searchString', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
        .mockResolvedValue(mockFTListResponse_2);

      const searchStringRecommendation = await service
        .determineSearchStringRecommendation(nodeClient, mockKeys);
      expect(searchStringRecommendation).toEqual(null);
    });

    it('should return searchString recommendation when there is big string key', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
        .mockResolvedValue(mockFTListResponse_1);

      const searchStringRecommendation = await service
        .determineSearchStringRecommendation(nodeClient, [...mockKeys, mockHugeStringKey1]);
      expect(searchStringRecommendation)
        .toEqual({
          name: RECOMMENDATION_NAMES.SEARCH_STRING,
          params: { keys: [mockHugeStringKey1.name] },
        });
    });

    it('should return not searchString recommendation when there is no big string key', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
        .mockResolvedValue(mockFTListResponse_1);

      const searchStringRecommendation = await service
        .determineSearchStringRecommendation(nodeClient, mockKeys);
      expect(searchStringRecommendation)
        .toEqual(null);
    });

    it('should return searchJSON recommendation when command executed with error',
      async () => {
        when(nodeClient.sendCommand)
          .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
          .mockRejectedValue('some error');

        const searchStringRecommendation = await service
          .determineSearchStringRecommendation(nodeClient, [mockHugeStringKey1]);
        expect(searchStringRecommendation)
          .toEqual({
            name: RECOMMENDATION_NAMES.SEARCH_STRING,
            params: { keys: [mockHugeStringKey1.name] },
          });
      });
  });
});
