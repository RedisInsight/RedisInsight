import { expect, describe, deps, before, getMainCheckFn, requirements } from '../deps';
import { analysisSchema } from './constants';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
) =>
  request(server).post(`/${constants.API.DATABASES}/${instanceId}/analysis`);

const responseSchema = analysisSchema;
const mainCheckFn = getMainCheckFn(endpoint);
let repository;

describe('POST /databases/:instanceId/analysis', () => {
  // todo: skip for RE for now since scan 0 count 10000 might return cursor and 0 keys multiple times
  requirements('!rte.re');

  before(async () => {
    repository = await localDb.getRepository(localDb.repositories.DATABASE_ANALYSIS);

    await localDb.generateNDatabaseAnalysis({
      databaseId: constants.TEST_INSTANCE_ID,
    }, 30, true);

    await rte.data.generateKeys(true);
  });

  [
    {
      name: 'Should create new database analysis and clean history up to 5',
      data: {
        delimiter: '-',
      },
      statusCode: 201,
      responseSchema,
      before: async () => {
        expect(await repository.count()).to.eq(30);
      },
      checkFn: async ({ body }) => {
        expect(body.totalKeys.total).to.gt(0);
        expect(body.totalMemory.total).to.gt(0);
        expect(body.topKeysNsp.length).to.gt(0);
        expect(body.topMemoryNsp.length).to.gt(0);
        expect(body.topKeysLength.length).to.gt(0);
        expect(body.topKeysMemory.length).to.gt(0);
        expect(body.expirationGroups.length).to.gt(0);
        expect(body.db).to.gte(0);
      },
      after: async () => {
        expect(await repository.count()).to.eq(5);
      }
    },
    {
      name: 'Should create new database analysis w/o namespaces',
      data: {
        delimiter: 'somestrangedelimiter',
      },
      statusCode: 201,
      responseSchema,
      checkFn: async ({ body }) => {
        expect(body.totalKeys.total).to.gt(0);
        expect(body.totalMemory.total).to.gt(0);
        expect(body.topKeysNsp.length).to.eq(0);
        expect(body.topMemoryNsp.length).to.eq(0);
        expect(body.topKeysLength.length).to.gt(0);
        expect(body.topKeysMemory.length).to.gt(0);
        expect(body.expirationGroups.length).to.gt(0);
        expect(body.db).to.gte(0);
      },
      after: async () => {
        expect(await repository.count()).to.eq(5);
      }
    },
    {
      name: 'Should create new database analysis with applied filter',
      data: {
        delimiter: '-',
        filter: {
          match: constants.TEST_STRING_KEY_1,
          count: 10_000_000,
        },
      },
      statusCode: 201,
      responseSchema,
      checkFn: async ({ body }) => {
        expect(body.delimiter).to.eq('-');
        expect(body.progress.total).to.gt(0);
        expect(body.progress.scanned).to.gte(10_000_000);
        expect(body.progress.processed).to.eq(1);
        expect(body.filter).to.deep.eq({
          match: constants.TEST_STRING_KEY_1,
          count: 10_000_000,
        });
        expect(body.totalKeys).to.deep.eq({
          total: 1,
          types: [{
            type: 'string',
            total: 1,
          }],
        });
        expect(body.totalMemory.total).to.gt(0);
        expect(body.totalMemory.types.length).to.eq(1);
        expect(body.totalMemory.types[0].total).to.gt(0);
        expect(body.totalMemory.types[0].type).to.eq('string');

        expect(body.topKeysNsp.length).to.eq(1);
        expect(constants.TEST_STRING_KEY_1.indexOf(body.topKeysNsp[0].nsp)).to.eq(0);
        expect(body.topKeysNsp[0].keys).to.eq(1);
        expect(body.topKeysNsp[0].memory).to.gt(0);
        expect(body.topKeysNsp[0].types.length).to.eq(1);
        expect(body.topKeysNsp[0].types[0].type).to.eq('string');
        expect(body.topKeysNsp[0].types[0].memory).to.gt(0);
        expect(body.topKeysNsp[0].types[0].keys).to.eq(1);

        expect(body.topMemoryNsp.length).to.eq(1);
        expect(constants.TEST_STRING_KEY_1.indexOf(body.topMemoryNsp[0].nsp)).to.eq(0);
        expect(body.topMemoryNsp[0].keys).to.eq(1);
        expect(body.topMemoryNsp[0].memory).to.gt(0);
        expect(body.topMemoryNsp[0].types.length).to.eq(1);
        expect(body.topMemoryNsp[0].types[0].type).to.eq('string');
        expect(body.topMemoryNsp[0].types[0].memory).to.gt(0);
        expect(body.topMemoryNsp[0].types[0].keys).to.eq(1);

        expect(body.topKeysMemory.length).to.eq(1);
        expect(body.topKeysMemory[0].name).to.eq(constants.TEST_STRING_KEY_1);
        expect(body.topKeysMemory[0].type).to.eq('string');
        expect(body.topKeysMemory[0].ttl).to.eq(-1);
        expect(body.topKeysMemory[0].memory).to.gt(0);
        expect(body.topKeysMemory[0].length).to.gt(0);

        expect(body.topKeysLength.length).to.eq(1);
        expect(body.topKeysLength[0].name).to.eq(constants.TEST_STRING_KEY_1);
        expect(body.topKeysLength[0].type).to.eq('string');
        expect(body.topKeysLength[0].ttl).to.eq(-1);
        expect(body.topKeysLength[0].memory).to.gt(0);
        expect(body.topKeysLength[0].length).to.gt(0);

        expect(body.expirationGroups.length).to.eq(8);
        for (let i = 1; i < 8; i++) {
          expect(body.expirationGroups[i].label).to.be.a('string');
          expect(body.expirationGroups[i].total).to.eq(0);
          expect(body.expirationGroups[i].threshold).to.gt(0);
        }
        expect(body.expirationGroups[0].label).to.eq('No Expiry');
        expect(body.expirationGroups[0].total).to.gt(0);
        expect(body.expirationGroups[0].threshold).to.eq(0);
        expect(body.db).to.eq(0);
      },
      after: async () => {
        expect(await repository.count()).to.eq(5);
      }
    },
  ].map(mainCheckFn);

  describe('recommendations', () => {
    requirements('!rte.bigData');

    beforeEach(async () => {
      await rte.data.truncate();
    });

    describe('useSmallerKeys recommendation', () => {
      // generate 1M keys take a lot of time
      requirements('!rte.type=CLUSTER');

      [
        {
          name: 'Should create new database analysis with useSmallerKeys recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            await rte.data.truncate();
            const KEYS_NUMBER = 1_000_006;
            await rte.data.generateNKeys(KEYS_NUMBER, false);
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_SMALLER_KEYS_DATABASE_ANALYSIS_RECOMMENDATION,
              constants.TEST_COMBINE_SMALL_STRING_TO_HASHES_RECOMMENDATION,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          }
        },
      ].map(mainCheckFn);
    });

    describe('redisVersion recommendation', () => {
      // todo find solution for redis pass
      requirements('rte.version <= 6', '!rte.pass');
      [
        {
          name: 'Should create new database analysis with redisVersion recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_REDIS_VERSION_RECOMMENDATION,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          }
        },
      ].map(mainCheckFn);
    });

    describe('setPassword recommendation', () => {
      requirements('!rte.pass');
      [
        {
          name: 'Should create new database analysis with setPassword recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_SET_PASSWORD_RECOMMENDATION,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          }
        },
      ].map(mainCheckFn);
    });

    describe('rediSearch recommendation', () => {
      [
        {
          name: 'Should create new database analysis with rediSearch recommendation',
          data: {
            delimiter: '-',
          },
          before: async () => {
            await rte.data.sendCommand('SET', [constants.TEST_STRING_KEY_1, Buffer.alloc(513 * 1024, 'a').toString()]);
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_REDISEARCH_RECOMMENDATION,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          }
        },
      ].map(mainCheckFn);
    });

    describe('recommendations with ReJSON', () => {
      requirements('rte.modules.rejson');
      [
        {
          name: 'Should create new database analysis with rediSearch recommendation',
          data: {
            delimiter: '-',
          },
          before: async () => {
            const NUMBERS_REJSONS = 1;
            await rte.data.generateNReJSONs(NUMBERS_REJSONS, true);
          },
          statusCode: 201,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_REDISEARCH_RECOMMENDATION,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          }
        },
        {
          name: 'Should create new database analysis with searchIndexes recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            const jsonValue = JSON.stringify(constants.TEST_REJSON_VALUE_1);
            await rte.data.sendCommand('ZADD', [constants.TEST_ZSET_KEY_1, constants.TEST_ZSET_MEMBER_1_SCORE, constants.TEST_ZSET_MEMBER_1]);
            await rte.data.sendCommand('json.set', [constants.TEST_ZSET_MEMBER_1, '.', jsonValue]);
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_SEARCH_INDEXES_RECOMMENDATION,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          }
        },
      ].map(mainCheckFn);
    });

    describe('searchIndexes recommendation', () => {
      requirements('!rte.pass');
      [
        {
          name: 'Should create new database analysis with searchIndexes recommendation',
          data: {
            delimiter: '-',
          },
          statusCode: 201,
          responseSchema,
          before: async () => {
            await rte.data.sendCommand('ZADD', [constants.TEST_ZSET_KEY_1, constants.TEST_ZSET_MEMBER_1_SCORE, constants.TEST_ZSET_MEMBER_1]);
            await rte.data.sendCommand('HSET', [constants.TEST_ZSET_MEMBER_1, constants.TEST_HASH_FIELD_1_NAME, constants.TEST_HASH_FIELD_1_VALUE]);
          },
          checkFn: async ({ body }) => {
            expect(body.recommendations).to.include.deep.members([
              constants.TEST_SEARCH_INDEXES_RECOMMENDATION,
            ]);
          },
          after: async () => {
            expect(await repository.count()).to.eq(5);
          }
        },
      ].map(mainCheckFn);
    });

    [
      {
        name: 'Should create new database analysis with bigHashes recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_HASH_FIELDS = 5001;
          await rte.data.generateHugeNumberOfFieldsForHashKey(NUMBERS_OF_HASH_FIELDS, true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_BIG_HASHES_DATABASE_ANALYSIS_RECOMMENDATION,
            constants.TEST_HASH_HASHTABLE_TO_ZIPLIST_RECOMMENDATION,
            constants.TEST_COMPRESS_HASH_FIELD_NAMES_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with increaseSetMaxIntsetEntries recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_SET_MEMBERS = 513;
          await rte.data.generateHugeNumberOfMembersForSetKey(NUMBERS_OF_SET_MEMBERS, true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_INCREASE_SET_MAX_INTSET_ENTRIES_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with combineSmallStringsToHashes recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          await rte.data.generateStrings(true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_COMBINE_SMALL_STRING_TO_HASHES_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with hashHashtableToZiplist recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_HASH_FIELDS = 513;
          await rte.data.generateHugeNumberOfFieldsForHashKey(NUMBERS_OF_HASH_FIELDS, true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_HASH_HASHTABLE_TO_ZIPLIST_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with compressHashFieldNames recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_HASH_FIELDS = 1001;
          await rte.data.generateHugeNumberOfFieldsForHashKey(NUMBERS_OF_HASH_FIELDS, true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_HASH_HASHTABLE_TO_ZIPLIST_RECOMMENDATION,
            constants.TEST_COMPRESS_HASH_FIELD_NAMES_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with compressionForList recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_LIST_ELEMENTS = 1001;
          await rte.data.generateHugeElementsForListKey(NUMBERS_OF_LIST_ELEMENTS, true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_COMPRESSION_FOR_LIST_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with bigStrings recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const BIG_STRING_MEMORY = 5_000_001;
          const bigStringValue = Buffer.alloc(BIG_STRING_MEMORY, 'a').toString();

          await rte.data.sendCommand('set', [constants.TEST_STRING_KEY_1, bigStringValue]);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_BIG_STRINGS_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with zSetHashtableToZiplist recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_ZSET_MEMBERS = 129;
          await rte.data.generateHugeMembersForSortedListKey(NUMBERS_OF_ZSET_MEMBERS, true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_ZSET_HASHTABLE_TO_ZIPLIST_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with bigSets recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const NUMBERS_OF_SET_MEMBERS = 5001;
          await rte.data.generateHugeNumberOfMembersForSetKey(NUMBERS_OF_SET_MEMBERS, true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            // by default max_intset_entries = 512
            constants.TEST_INCREASE_SET_MAX_INTSET_ENTRIES_RECOMMENDATION,
            constants.TEST_BIG_SETS_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with luaScript recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          await rte.data.generateNCachedScripts(11, true);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.include.deep.members([
            constants.TEST_LUA_DATABASE_ANALYSIS_RECOMMENDATION,
          ]);
        },
        after: async () => {
          await rte.data.sendCommand('script', ['flush']);
          expect(await repository.count()).to.eq(5);
        }
      },
    ].map(mainCheckFn);
  });
});
