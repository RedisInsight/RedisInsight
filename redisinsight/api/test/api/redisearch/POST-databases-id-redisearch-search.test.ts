import {
  expect,
  describe,
  before,
  Joi,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn, JoiRedisString
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/instance/${instanceId}/redisearch/search`);

// input data schema
const dataSchema = Joi.object({
  index: Joi.string().allow('').required(),
  query: Joi.string().allow('').required(),
  limit: Joi.number().integer(),
  offset: Joi.number().integer(),
}).strict();

const validInputData = {
  index: constants.TEST_SEARCH_HASH_INDEX_1,
  query: '*',
  limit: 10,
  offset: 0,
};

const responseSchema = Joi.object({
  cursor: Joi.number().integer().required(),
  scanned: Joi.number().integer().required(),
  total: Joi.number().integer().required(),
  keys: Joi.array().items(Joi.object({
    name: JoiRedisString.required(),
  })).required(),
}).required().strict(true);
const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:id/redisearch/search', () => {
  requirements('!rte.bigData', 'rte.modules.search');
  before(async () => rte.data.generateRedisearchIndexes(true));

  describe('Main', () => {
    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should search data (limit 10)',
          data: validInputData,
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.keys.length).to.eq(10);
            expect(body.cursor).to.eq(10);
            expect(body.scanned).to.eq(10);
            expect(body.total).to.eq(2000);
          },
        },
        {
          name: 'Should search 100 entries (continue from previous 10)',
          data: {
            ...validInputData,
            offset: 10,
            limit: 100,
          },
          responseSchema,
          checkFn: async ({ body }) => {
            expect(body.keys.length).to.eq(100);
            expect(body.cursor).to.eq(110);
            expect(body.scanned).to.eq(110);
            expect(body.total).to.eq(2000);
          },
        },
      ].map(mainCheckFn);
    });

    describe('ACL', () => {
      requirements('rte.acl');
      before(async () => rte.data.setAclUserRules('~* +@all'));

      [
        {
          name: 'Should search',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: validInputData,
          responseSchema,
        },
        {
          name: 'Should throw error if no permissions for "ft.search" command',
          endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
          data: {
            ...validInputData,
            index: constants.getRandomString(),
          },
          statusCode: 403,
          responseBody: {
            statusCode: 403,
            error: 'Forbidden',
          },
          before: () => rte.data.setAclUserRules('~* +@all -ft.search')
        },
      ].map(mainCheckFn);
    });
  });
});
