import {
  expect,
  describe,
  it,
  before,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  validateApiCall
} from '../deps';
const { server, request, constants, rte } = deps;
import * as Joi from 'joi';

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(`/instance/${instanceId}/hash/get-fields`);

// input data schema // todo: review BE for transform true -> 1
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  cursor: Joi.number().integer().min(0).allow(true).required().messages({
    'any.required': 'cursor should not be empty'
  }),
  count: Joi.number().integer().min(1).allow(true, null).messages({
    'any.required': 'count should not be empty'
  }),
  match: Joi.string().allow(null),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  cursor: 0,
  count: 1,
  match: constants.getRandomString(),
};

const responseSchema = Joi.object().keys({
  keyName: Joi.string().required(),
  total: Joi.number().integer().required(),
  fields: Joi.array().items(Joi.object().keys({
    field: Joi.string().required(),
    value: Joi.string().required(),
  })),
  nextCursor: Joi.number().integer().required(),
}).required();

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

describe('POST /instance/:instanceId/hash/get-fields', () => {
  before(async () => await rte.data.generateKeys(true));

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should find by exact match',
        data: {
          keyName: constants.TEST_HASH_KEY_2,
          cursor: 0,
          count: 15,
          match: 'field_9'
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
          expect(body.total).to.eql(3000);
          expect(body.fields.length).to.eql(1);
          expect(body.fields[0].field).to.eql('field_9');
          expect(body.fields[0].value).to.eql('value_9');
        }
      },
      {
        name: 'Should not find any field',
        data: {
          keyName: constants.TEST_HASH_KEY_2,
          cursor: 0,
          count: 15,
          match: 'field_9asd*'
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
          expect(body.total).to.eql(3000);
          expect(body.fields.length).to.eql(0);
        }
      },
      {
        name: 'Should query 15 fields',
        data: {
          keyName: constants.TEST_HASH_KEY_2,
          cursor: 0,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
          expect(body.total).to.eql(3000);
          expect(body.fields.length).to.gte(15);
          expect(body.fields.length).to.lt(3000);
        }
      },
      {
        name: 'Should query by * in the end',
        data: {
          keyName: constants.TEST_HASH_KEY_2,
          cursor: 0,
          count: 15,
          match: 'field_219*'
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
          expect(body.total).to.eql(3000);
          expect(body.fields.length).to.eq(11);
        }
      },
      {
        name: 'Should query by * in the beginning',
        data: {
          keyName: constants.TEST_HASH_KEY_2,
          cursor: 0,
          count: 15,
          match: '*eld_9'
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
          expect(body.total).to.eql(3000);
          expect(body.fields.length).to.eq(1);
          expect(body.fields[0].field).to.eql('field_9');
          expect(body.fields[0].value).to.eql('value_9');
        }
      },
      {
        name: 'Should query by * in the middle',
        data: {
          keyName: constants.TEST_HASH_KEY_2,
          cursor: 0,
          count: 15,
          match: 'f*eld_9'
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(body.keyName).to.eql(constants.TEST_HASH_KEY_2);
          expect(body.total).to.eql(3000);
          expect(body.fields.length).to.eq(1);
          expect(body.fields[0].field).to.eql('field_9');
          expect(body.fields[0].value).to.eql('value_9');
        }
      },
      {
        name: 'Should return NotFound error if key does not exists',
        data: {
          keyName: constants.getRandomString(),
          cursor: 0,
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Key with this name does not exist.',
        },
      },
      {
        name: 'Should return NotFound error if instance id does not exists',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          keyName: constants.TEST_HASH_KEY_1,
          cursor: 0,
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Invalid database instance id.',
        },
      },
    ].map(mainCheckFn);

    describe('Search in huge number of fields', () => {
      requirements('rte.onPremise');
      // Number of fields to generate. Could be 10M or even more but consume much more time
      // We decide to generate 500K which should take ~10s
      const NUMBER_OF_FIELDS = 500 * 1000;
      before(async () => await rte.data.generateHugeNumberOfFieldsForHashKey(NUMBER_OF_FIELDS, true));

      [
        {
          name: 'Should find exact one key',
          data: {
            keyName: constants.TEST_HASH_KEY_1,
            cursor: 0,
            count: 15,
            match: 'f_48900'
          },
          responseSchema,
          checkFn: ({ body }) => {
            expect(body.keyName).to.eql(constants.TEST_HASH_KEY_1);
            expect(body.total).to.eql(NUMBER_OF_FIELDS);
            expect(body.fields.length).to.eq(1);
            expect(body.fields[0].field).to.eql('f_48900');
            expect(body.fields[0].value).to.eql('v');
          }
        },
      ].map(mainCheckFn);
    });
  });

  describe('ACL', () => {
    requirements('rte.acl');
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should not delete member',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_HASH_KEY_1,
          cursor: 0,
        },
        responseSchema,
      },
      {
        name: 'Should throw error if no permissions for "hlen" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_HASH_KEY_1,
          cursor: 0,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -hlen')
      },
      {
        name: 'Should throw error if no permissions for "hget" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_HASH_KEY_1,
          cursor: 0,
          match: 'asd',
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -hget')
      },
      {
        name: 'Should throw error if no permissions for "hscan" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_HASH_KEY_1,
          cursor: 0,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -hscan')
      },
    ].map(mainCheckFn);
  });
});
