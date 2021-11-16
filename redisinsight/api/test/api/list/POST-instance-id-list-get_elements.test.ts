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
  request(server).post(`/instance/${instanceId}/list/get-elements`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  offset: Joi.number().integer().min(0)
    .allow(true), // todo: investigate/fix BE payload transform function
  count: Joi.number().integer().min(1)
    .allow(true), // todo: investigate/fix BE payload transform function
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  offset: 0,
  count: 20,
};

const responseSchema = Joi.object().keys({
  keyName: Joi.string().required(),
  total: Joi.number().integer().required(),
  elements: Joi.array().items(Joi.string()).required(),
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

describe('POST /instance/:instanceId/list/get-elements', () => {
  before(rte.data.truncate);

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    before(async () => await rte.data.generateKeys(true));

    [
      {
        name: 'Should select all keys',
        data: {
          keyName: constants.TEST_LIST_KEY_2,
          offset: 0,
          count: 1000,
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_LIST_KEY_2,
          total: 100,
          elements: (new Array(100).fill(0)).map((item, i) => `element_${i + 1}`),
        },
      },
      {
        name: 'Should select last 50 keys',
        data: {
          keyName: constants.TEST_LIST_KEY_2,
          offset: 50,
          count: 1000,
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_LIST_KEY_2,
          total: 100,
          elements: (new Array(50).fill(0)).map((item, i) => `element_${i + 51}`),
        },
      },
      {
        name: 'Should select first 50 keys',
        data: {
          keyName: constants.TEST_LIST_KEY_2,
          offset: 0,
          count: 50,
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_LIST_KEY_2,
          total: 100,
          elements: (new Array(50).fill(0)).map((item, i) => `element_${i + 1}`),
        },
      },
      {
        name: 'Should return NotFound error if key does not exists',
        data: {
          keyName: constants.getRandomString(),
          offset: 0,
          count: 1000,
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
          keyName: constants.TEST_LIST_KEY_2,
          offset: 0,
          count: 1000,
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
          keyName: constants.TEST_LIST_KEY_1,
          offset: 0,
          count: 1000,
        },
        responseSchema,
      },
      {
        name: 'Should throw error if no permissions for "llen" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_LIST_KEY_1,
          offset: 0,
          count: 1000,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -llen')
      },
      {
        name: 'Should throw error if no permissions for "lrange" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_LIST_KEY_1,
          offset: 0,
          count: 1000,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -lrange')
      },
    ].map(mainCheckFn);
  });
});
