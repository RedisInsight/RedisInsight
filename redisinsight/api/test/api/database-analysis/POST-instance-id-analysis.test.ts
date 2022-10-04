import { describe, deps, before, getMainCheckFn } from '../deps';
import { analysisSchema } from './constants';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
) =>
  request(server).post(`/instance/${instanceId}/analysis`);

const responseSchema = analysisSchema;
const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /instance/:instanceId/analysis', () => {
  before(async() => {
      await localDb.generateNDatabaseAnalysis({
        databaseId: constants.TEST_INSTANCE_ID,
      }, 30, true);

      await rte.data.generateKeys(true);
  });

  [
    {
      name: 'Should create database analysis',
      query: {
        delimiter: '-',
      },
      statusCode: 201,
      responseSchema,
    },
  ].map(mainCheckFn);
});
