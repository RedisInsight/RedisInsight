import { expect, describe, deps, before, getMainCheckFn } from '../deps';
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
  before(async() => {
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
        for(let i = 1; i < 8; i++) {
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
});
