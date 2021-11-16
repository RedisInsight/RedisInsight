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
  request(server).put(`/instance/${instanceId}/list`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  element: Joi.string().required(),
  destination: Joi.string().valid('HEAD', 'TAIL'),
}).strict();

const validInputData = {
  keyName: constants.getRandomString(),
  element: constants.getRandomString(),
  destination: 'TAIL',
};

const responseSchema = Joi.object().keys({
  keyName: Joi.string().required(),
  total: Joi.number().integer().required(),
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

describe('PUT /instance/:instanceId/list', () => {
  before(rte.data.truncate);
  before(async () => await rte.data.generateKeys(true));

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    before(async () => await rte.data.generateKeys(true));

    [
      {
        name: 'Should insert 1 element to the tail (by default)',
        data: {
          keyName: constants.TEST_LIST_KEY_1,
          element: constants.getRandomString(),
          destination: 'TAIL',
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_LIST_KEY_1,
          total: 3,
        },
        after: async function () {
          const elements = await rte.client.lrange(constants.TEST_LIST_KEY_1, 0, 1000);
          expect(elements[2]).to.eql(this.data.element);
        },
      },
      {
        name: 'Should insert 1 element to the tail',
        data: {
          keyName: constants.TEST_LIST_KEY_1,
          element: constants.getRandomString(),
          destination: 'TAIL',
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_LIST_KEY_1,
          total: 4,
        },
        after: async function () {
          const elements = await rte.client.lrange(constants.TEST_LIST_KEY_1, 0, 1000);
          expect(elements[3]).to.eql(this.data.element);
        },
      },
      {
        name: 'Should insert 1 element to the head',
        data: {
          keyName: constants.TEST_LIST_KEY_1,
          element: constants.getRandomString(),
          destination: 'HEAD',
        },
        responseSchema,
        responseBody: {
          keyName: constants.TEST_LIST_KEY_1,
          total: 5,
        },
        after: async function () {
          const elements = await rte.client.lrange(constants.TEST_LIST_KEY_1, 0, 1000);
          expect(elements[0]).to.eql(this.data.element);
        },
      },
      {
        name: 'Should return NotFound error if key does not exists',
        data: {
          keyName: constants.getRandomString(),
          element: constants.getRandomString(),
          destination: 'HEAD',
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
          keyName: constants.TEST_LIST_KEY_1,
          element: constants.getRandomString(),
          destination: 'HEAD',
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
          element: constants.getRandomString(),
          destination: 'TAIL',
        },
        responseSchema,
      },
      {
        name: 'Should throw error if no permissions for "lpushx" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_LIST_KEY_1,
          element: constants.getRandomString(),
          destination: 'HEAD',
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -lpushx')
      },
      {
        name: 'Should throw error if no permissions for "rpushx" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.TEST_LIST_KEY_1,
          element: constants.getRandomString(),
          destination: 'TAIL',
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -rpushx')
      },
    ].map(mainCheckFn);
  });
});
