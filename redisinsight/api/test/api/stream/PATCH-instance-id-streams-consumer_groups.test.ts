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
  request(server).patch(`/instance/${instanceId}/streams/consumer-groups`);

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  name: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
  lastDeliveredId: Joi.string().required().messages({
    'any.required': '{#label} should not be empty',
  }),
}).strict();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
  name: constants.TEST_STREAM_GROUP_1,
  lastDeliveredId: '$',
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

describe('PATCH /instance/:instanceId/streams/consumer-groups', () => {
  before(async () => await rte.data.generateKeys(true));

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    beforeEach(async () => {
      await rte.client.del(constants.TEST_STREAM_KEY_2);
      await rte.client.xadd(constants.TEST_STREAM_KEY_2, '*', 'f', 'v');
    });

    [
      {
        name: 'Should update lastDeliveredId',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          name: constants.TEST_STREAM_GROUP_1,
          lastDeliveredId: constants.TEST_STREAM_ID_2,
        },
        before: async () => {
          const [group] = await rte.data.sendCommand('xinfo', ['groups', constants.TEST_STREAM_KEY_1]);
          expect(group[7]).to.eq(constants.TEST_STREAM_ID_1);
        },
        after: async () => {
          const [group] = await rte.data.sendCommand('xinfo', ['groups', constants.TEST_STREAM_KEY_1]);
          expect(group[7]).to.eq(constants.TEST_STREAM_ID_2);
        },
      },
      {
        name: 'Should return BadRequest error if key has another type',
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
        name: 'Should return NotFound error if key does not exists',
        data: {
          ...validInputData,
          keyName: constants.getRandomString(),
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Key with this name does not exist.',
        },
      },
      {
        name: 'Should return NotFound error if group does not exists',
        data: {
          ...validInputData,
          keyName: constants.TEST_STREAM_KEY_2,
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Consumer Group with such name was not found.',
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

    before(async () => await rte.data.generateKeys(true));
    before(async () => rte.data.setAclUserRules('~* +@all'));

    [
      {
        name: 'Should create consumer group',
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
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -exists')
      },
      {
        name: 'Should throw error if no permissions for "xgroup" command',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ACL_ID),
        data: {
          ...validInputData,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
        before: () => rte.data.setAclUserRules('~* +@all -xgroup')
      },
    ].map(mainCheckFn);
  });
});
