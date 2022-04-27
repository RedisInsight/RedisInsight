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
  request(server).put(`/instance/${instanceId}/streams`);

const entrySchema = Joi.object().keys({
  id: Joi.string().label('entries.0.id').required(),
  fields: Joi.object().label('entries.0.fields').required()
    .messages({
      'object.base': '{#label} must be an object',
    }),
});

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  entries: Joi.array().items(entrySchema).required().messages({
    'array.sparse': 'entries must be either object or array',
    'array.base': 'property {#label} must be either object or array',
  }),
}).strict();

const responseSchema = Joi.object().keys({
  keyName: Joi.string().required(),
  total: Joi.number().integer().required(),
  lastGeneratedId: Joi.string().required(),
  firstEntry: entrySchema.required(),
  lastEntry: entrySchema.required(),
  entries: Joi.array().items(entrySchema.required()).required(),
}).required();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
  entries: [
    {
      id: '*',
      fields: {
        [constants.TEST_STREAM_FIELD_1]: constants.TEST_STREAM_VALUE_1,
        [constants.TEST_STREAM_FIELD_2]: constants.TEST_STREAM_VALUE_2,
      }
    }
  ],
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

describe('POST /instance/:instanceId/streams/get-entries', () => {
  before(async () => await rte.data.generateKeys(true));

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should add entry',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          entries: [
            {
              id: '*',
              fields: {
                [constants.TEST_STREAM_FIELD_1]: constants.TEST_STREAM_FIELD_1,
              }
            }
          ]
        },
        after: async () => {
          expect(await rte.client.xlen(constants.TEST_STREAM_KEY_1)).to.eq(2);
          const [entry] = await rte.client.xrevrange(constants.TEST_STREAM_KEY_1, '+', '-', 'COUNT', 1);
          expect(entry[1]).to.eql([constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_FIELD_1]);
        },
      },
      {
        name: 'Should add multiple entries and multiple fields',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          entries: [
            {
              id: '*',
              fields: {
                [constants.TEST_STREAM_FIELD_1]: constants.TEST_STREAM_FIELD_1,
                [constants.TEST_STREAM_FIELD_2]: constants.TEST_STREAM_FIELD_2,
              }
            },
            {
              id: '*',
              fields: {
                [constants.TEST_STREAM_VALUE_1]: constants.TEST_STREAM_VALUE_1,
                [constants.TEST_STREAM_VALUE_2]: constants.TEST_STREAM_VALUE_2,
              }
            },
          ]
        },
        after: async () => {
          expect(await rte.client.xlen(constants.TEST_STREAM_KEY_1)).to.eq(4);
          const [entry1, entry2] = await rte.client.xrevrange(constants.TEST_STREAM_KEY_1, '+', '-', 'COUNT', 2);
          expect(entry1[1]).to.eql(
            [
              constants.TEST_STREAM_VALUE_1, constants.TEST_STREAM_VALUE_1,
              constants.TEST_STREAM_VALUE_2, constants.TEST_STREAM_VALUE_2,
            ]
          );
          expect(entry2[1]).to.eql(
            [
              constants.TEST_STREAM_FIELD_1, constants.TEST_STREAM_FIELD_1,
              constants.TEST_STREAM_FIELD_2, constants.TEST_STREAM_FIELD_2,
            ]
          );
        },
      },
      {
        name: 'Should return BadRequest when try to work with non-stream type',
        data: {
          ...validInputData,
          keyName: constants.TEST_STRING_KEY_1,
        },
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          error: 'Bad Request',
        },
      },
      {
        name: 'Should return BadRequest when id specified is less then the latest one',
        data: {
          ...validInputData,
          entries: [
            {
              ...validInputData.entries[0],
              id: '100',
            }
          ]
        },
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          error: 'Bad Request',
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
        name: 'Should add entries',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          ...validInputData,
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
