import {
  expect,
  describe,
  it,
  before,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/instance/${instanceId}/streams`);

const entrySchema = Joi.object().keys({
  id: Joi.string().label('entries.0.id').required(),
  fields: Joi.array().label('entries.0.fields').required()
    .messages({
      'object.base': '{#label} must be an array',
    }),
});

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  entries: Joi.array().items(entrySchema).required().messages({
    'array.sparse': 'entries must be either object or array',
    'array.base': 'property {#label} must be an array',
  }),
  expire: Joi.number().integer().allow(null).min(1).max(2147483647),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  entries: [
    {
      id: constants.TEST_STREAM_ID_1,
      fields: [
        [constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_VALUE_1],
        [constants.TEST_STREAM_FIELD_2, constants.TEST_STREAM_VALUE_2],
      ]
    }
  ],
  expire: constants.TEST_STREAM_EXPIRE_1,
};

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    }
  });
};

describe('POST /instance/:instanceId/streams', () => {
  before(async () => await rte.data.generateKeys(true));

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    beforeEach(async () => {
      await rte.client.del(constants.TEST_STREAM_KEY_1);
    });

    [
      {
        name: 'Should create stream with single entry and single field',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          entries: [
            {
              id: '*',
              fields: [
                [constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_VALUE_1],
              ],
            }
          ]
        },
        statusCode: 201,
        after: async () => {
          const entries = await rte.client.xrange(constants.TEST_STREAM_KEY_1, '-', '+');
          expect(entries[0][1]).to.eql([constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_VALUE_1]);
        },
      },
      {
        name: 'Should create stream with ttl',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          entries: [
            {
              id: '*',
              fields: [
                [constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_VALUE_1],
              ],
            },
          ],
          expire: constants.TEST_STREAM_EXPIRE_1,
        },
        statusCode: 201,
        after: async () => {
          const ttl = await rte.client.ttl(constants.TEST_STREAM_KEY_1);
          expect(ttl).to.lte(constants.TEST_STREAM_EXPIRE_1);
          expect(ttl).to.gt(0);

          const entries = await rte.client.xrange(constants.TEST_STREAM_KEY_1, '-', '+');
          expect(entries[0][1]).to.eql([constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_VALUE_1]);
        },
      },
      {
        name: 'Should create stream with multiple entries and multiple fields',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          entries: [
            {
              id: '*',
              fields: [
                [constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_VALUE_1],
                [constants.TEST_STREAM_FIELD_2, constants.TEST_STREAM_VALUE_2],
              ]
            },
            {
              id: '*',
              fields: [
                [constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_VALUE_1],
                [constants.TEST_STREAM_FIELD_2, constants.TEST_STREAM_VALUE_2],
              ]
            },
          ]
        },
        statusCode: 201,
        after: async () => {
          const entries = await rte.client.xrange(constants.TEST_STREAM_KEY_1, '-', '+');
          expect(entries[0][1]).to.eql([
            constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_VALUE_1,
            constants.TEST_STREAM_FIELD_2, constants.TEST_STREAM_VALUE_2,
          ]);
          expect(entries[1][1]).to.eql([
            constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_VALUE_1,
            constants.TEST_STREAM_FIELD_2, constants.TEST_STREAM_VALUE_2,
          ]);
        },
      },
      {
        name: 'Should return Conflict error when trying to create key with existing key name',
        data: {
          ...validInputData,
          keyName: constants.TEST_STRING_KEY_1,
        },
        statusCode: 409,
        responseBody: {
          statusCode: 409,
          error: 'Conflict',
        },
      },
      {
        name: 'Should return NotFound error if instance id does not exists',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          ...validInputData,
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Invalid database instance id.',
        },
      },
    ].map(mainCheckFn);
  });

  describe('ACL', () => {
    requirements('rte.acl');
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should create stream',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        statusCode: 201,
        data: {
          ...validInputData,
          keyName: constants.getRandomString(),
        },
      },
      {
        name: 'Should throw error if no permissions for "exists" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          ...validInputData,
          keyName: constants.getRandomString(),
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -exists')
      },
      {
        name: 'Should throw error if no permissions for "xadd" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          ...validInputData,
          keyName: constants.getRandomString(),
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -xadd')
      },
    ].map(mainCheckFn);
  });
});
