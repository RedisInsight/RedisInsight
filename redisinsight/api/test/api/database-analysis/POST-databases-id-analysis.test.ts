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
      },
      after: async () => {
        expect(await repository.count()).to.eq(5);
      }
    },
  ].map(mainCheckFn);

  describe('recommendations', () => {
    beforeEach(async () => {
      await rte.data.truncate()
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
          expect(body.recommendations).to.deep.eq([
            constants.TEST_BIG_HASHES_DATABASE_ANALYSIS_RECOMMENDATION,
            constants.TEST_CONVERT_HASHTABLE_TO_ZIPLIST_RECOMMENDATION,
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
          expect(body.recommendations).to.deep.eq([constants.TEST_INCREASE_SET_MAX_INTSET_ENTRIES_RECOMMENDATION]);
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
          expect(body.recommendations).to.deep.eq([constants.TEST_COMBINE_SMALL_STRING_TO_HASHES_RECOMMENDATION]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with convertHashtableToZiplist recommendation',
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
          expect(body.recommendations).to.deep.eq([
            constants.TEST_CONVERT_HASHTABLE_TO_ZIPLIST_RECOMMENDATION,
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
          expect(body.recommendations).to.deep.eq([
            constants.TEST_CONVERT_HASHTABLE_TO_ZIPLIST_RECOMMENDATION,
            constants.TEST_COMPRESS_HASH_FIELD_NAMES_RECOMMENDATION,
          ]);
        },
        after: async () => {
          expect(await repository.count()).to.eq(5);
        }
      },
      {
        name: 'Should create new database analysis with useSmallerKeys recommendation',
        data: {
          delimiter: '-',
        },
        statusCode: 201,
        responseSchema,
        before: async () => {
          const KEYS_NUMBER = 1_000_001;
          await rte.data.generateHugeNumberOfTinyStringKeys(KEYS_NUMBER, false);
        },
        checkFn: async ({ body }) => {
          expect(body.recommendations).to.deep.eq([
            constants.TEST_SMALLER_KEYS_DATABASE_ANALYSIS_RECOMMENDATION,
            constants.TEST_COMBINE_SMALL_STRING_TO_HASHES_RECOMMENDATION,
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
          expect(body.recommendations).to.deep.eq([
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
          expect(body.recommendations).to.deep.eq([constants.TEST_BIG_STRINGS_RECOMMENDATION]);
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
          expect(body.recommendations).to.deep.eq([constants.TEST_LUA_DATABASE_ANALYSIS_RECOMMENDATION]);
        },
        after: async () => {
          await rte.data.sendCommand('script', ['flush']);
          expect(await repository.count()).to.eq(5);
        }
      },
    ].map(mainCheckFn);
  });
});
