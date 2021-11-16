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
  request(server).post(`/instance/${instanceId}/set`);

// input data schema
const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  members: Joi.array().items(Joi.string().allow(null)).required().messages({
    'string.base': 'each value in members must be a string',
  }),
  expire: Joi.number().integer().allow(null).min(1).max(2147483647),
}).strict();

const validInputData = {
  keyName: constants.TEST_SET_KEY_1,
  members: [constants.TEST_SET_MEMBER_1],
  expire: constants.TEST_SET_EXPIRE_1,
};

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    } else {
      if (testCase.statusCode === 201) {
        expect(await rte.client.exists(testCase.data.keyName)).to.eql(0);
      }
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    } else {
      if (testCase.statusCode === 201) {
        expect(await rte.client.exists(testCase.data.keyName)).to.eql(1);
        const scanResult = await rte.client.sscan(testCase.data.keyName, 0, 'count', 100);
        expect(scanResult[0]).to.eql('0'); // full scan completed
        expect(scanResult[1]).to.eql(testCase.data.members);
        expect(await rte.client.ttl(testCase.data.keyName)).to.eql(testCase.data.expire || -1);
      }
    }
  });
};

describe('POST /instance/:instanceId/set', () => {
  before(rte.data.truncate);

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should create item with empty value',
        data: {
          keyName: constants.getRandomString(),
          members: [''],
        },
        statusCode: 201,
      },
      {
        name: 'Should create item with key ttl',
        data: {
          keyName: constants.getRandomString(),
          members: [constants.getRandomString()],
          expire: constants.TEST_SET_EXPIRE_1,
        },
        statusCode: 201,
      },
      {
        name: 'Should create regular item',
        data: {
          keyName: constants.TEST_SET_KEY_1,
          members: [constants.TEST_SET_MEMBER_1],
        },
        statusCode: 201,
      },
      {
        name: 'Should return conflict error if key already exists',
        data: {
          keyName: constants.TEST_SET_KEY_1,
          members: [constants.getRandomString()],
        },
        statusCode: 409,
        responseBody: {
          statusCode: 409,
          error: 'Conflict',
          message: 'This key name is already in use.',
        },
        after: async () => {
          // check that value was not overwritten
          const scanResult = await rte.client.sscan(constants.TEST_SET_KEY_1, 0, 'count', 100);
          expect(scanResult[0]).to.eql('0'); // full scan completed
          expect(scanResult[1]).to.eql([constants.TEST_SET_MEMBER_1]);
        }
      },
      {
        name: 'Should return NotFound error if instance id does not exists',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          keyName: constants.TEST_LIST_KEY_1,
          members: [constants.getRandomString()],
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Invalid database instance id.',
        },
        after: async () => {
          // check that value was not overwritten
          const scanResult = await rte.client.sscan(constants.TEST_SET_KEY_1, 0, 'count', 100);
          expect(scanResult[0]).to.eql('0'); // full scan completed
          expect(scanResult[1]).to.eql([constants.TEST_SET_MEMBER_1]);
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
          keyName: constants.getRandomString(),
          members: [constants.getRandomString()],
        },
        statusCode: 201,
      },
      {
        name: 'Should throw error if no permissions for "sadd" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.getRandomString(),
          members: [constants.getRandomString()],
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -sadd')
      },
      {
        name: 'Should throw error if no permissions for "exists" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          keyName: constants.getRandomString(),
          members: [constants.getRandomString()],
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
