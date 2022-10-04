import { describe, deps, before, expect, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (
  instanceId = constants.TEST_INSTANCE_ID,
  id = constants.TEST_DATABASE_ANALYSIS_ID_1,
) =>
  request(server).get(`/instance/${instanceId}/analysis/${id}`);

export const typedTotalSchema = Joi.object({
  total: Joi.number().integer().required(),
  types: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    total: Joi.number().integer().required(),
  })),
});

export const nspSummarySchema = Joi.object({
  nsp: Joi.string().required(),
  memory: Joi.number().integer().required(),
  keys: Joi.number().integer().required(),
  types: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    memory: Joi.number().integer().required(),
    keys: Joi.number().integer().required(),
  })),
});

export const keySchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  memory: Joi.number().integer().required(),
  length: Joi.number().integer().required(),
  ttl: Joi.number().integer().required(),
});

export const analysisSchema = Joi.object().keys({
  id: Joi.string().required(),
  databaseId: Joi.string().required(),
  delimiter: Joi.string().required(),
  createdAt: Joi.date().required(),
  filter: Joi.object({
    type: Joi.string().allow(null).required(),
    match: Joi.string().required(),
    count: Joi.number().integer().required(),
  }).required(),
  progress: Joi.object({
    total: Joi.number().integer().required(),
    scanned: Joi.number().integer().required(),
    processed: Joi.number().integer().required(),
  }).required(),
  totalKeys: typedTotalSchema.required(),
  totalMemory: typedTotalSchema.required(),
  topKeysNsp: Joi.array().items(nspSummarySchema).required().max(15),
  topMemoryNsp: Joi.array().items(nspSummarySchema).required().max(15),
  topKeysLength: Joi.array().items(keySchema).required().max(15),
  topKeysMemory: Joi.array().items(keySchema).required().max(15),
}).required();

const responseSchema = analysisSchema;
const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /instance/:instanceId/analysis/:id', () => {
  before(async () => await localDb.generateNDatabaseAnalysis({
      databaseId: constants.TEST_INSTANCE_ID,
      id: constants.TEST_DATABASE_ANALYSIS_ID_1,
      createdAt: constants.TEST_DATABASE_ANALYSIS_CREATED_AT_1,
    }, 1, true),
  );

  [
    {
      name: 'Should get database analysis',
      responseSchema,
      checkFn: ({body}) => {
        expect(body).to.deep.eq({
          id: constants.TEST_DATABASE_ANALYSIS_ID_1,
          databaseId: constants.TEST_INSTANCE_ID,
          createdAt: constants.TEST_DATABASE_ANALYSIS_CREATED_AT_1.toISOString(),
          delimiter: constants.TEST_DATABASE_ANALYSIS_DELIMITER_1,
          filter: constants.TEST_DATABASE_ANALYSIS_FILTER_1,
          progress: constants.TEST_DATABASE_ANALYSIS_PROGRESS_1,
          totalKeys: constants.TEST_DATABASE_ANALYSIS_TOTAL_KEYS_1,
          totalMemory: constants.TEST_DATABASE_ANALYSIS_TOTAL_MEMORY_1,
          topKeysNsp: [constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_NSP_1],
          topMemoryNsp: [constants.TEST_DATABASE_ANALYSIS_TOP_MEMORY_NSP_1],
          topKeysLength: [constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_1],
          topKeysMemory: [constants.TEST_DATABASE_ANALYSIS_TOP_KEYS_1],
        });
      }
    },
    {
      name: 'Should return NotFound error if analysis does not exists',
      endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID, constants.TEST_NOT_EXISTED_INSTANCE_ID),
      statusCode: 404,
      responseBody: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Database analysis was not found.',
      },
    },
  ].map(mainCheckFn);
});
