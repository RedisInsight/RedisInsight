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
  request(server).put(`/instance/${instanceId}/hash`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  fields: Joi.array().items(Joi.object().keys({
    field: Joi.string().allow('').label('.field'),
    value: Joi.string().allow('').label('.value'),
  })).required().messages({
    'array.sparse': 'fields must be either object or array',
    'array.base': 'property {#label} must be either object or array',
  }),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  fields: [{
    field: constants.TEST_HASH_FIELD_1_NAME,
    value: constants.TEST_HASH_FIELD_1_VALUE,
  }],
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

describe('PUT /instance/:instanceId/hash', () => {
  before(async () => await rte.data.generateKeys(true));

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should add new field and edit existing value',
        data: {
          keyName: constants.TEST_HASH_KEY_1,
          fields: [{
            field: constants.TEST_HASH_FIELD_1_NAME,
            value: '',
          }, {
            field: 'new_field',
            value: 'new_value',
          }],
        },
        statusCode: 200,
        after: async () => {
          expect(await rte.client.hgetall(constants.TEST_HASH_KEY_1)).to.eql({
            [constants.TEST_HASH_FIELD_1_NAME]: '',
            [constants.TEST_HASH_FIELD_2_NAME]: constants.TEST_HASH_FIELD_2_VALUE,
            ['new_field']: 'new_value',
          });
        }
      },
      {
        name: 'Should return NotFound error if key does not exists',
        data: {
          keyName: constants.getRandomString(),
          fields: [{
            field: constants.getRandomString(),
            value: constants.getRandomString(),
          }],
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
          fields: [{
            field: constants.getRandomString(),
            value: constants.getRandomString(),
          }],
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
        name: 'Should create regular item',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_HASH_KEY_1,
          fields: [{
            field: constants.getRandomString(),
            value: constants.getRandomString(),
          }],
        },
        statusCode: 200,
      },
      {
        name: 'Should throw error if no permissions for "hset" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_HASH_KEY_1,
          fields: [{
            field: constants.getRandomString(),
            value: constants.getRandomString(),
          }],
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -hset')
      },
      {
        name: 'Should throw error if no permissions for "exists" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_HASH_KEY_1,
          fields: [{
            field: constants.getRandomString(),
            value: constants.getRandomString(),
          }],
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -exists')
      },
    ].map(mainCheckFn);
  });
});
