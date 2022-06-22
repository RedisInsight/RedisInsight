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
  request(server).delete(`/instance/${instanceId}/streams/consumer-groups`);

const dataSchema = Joi.object({
  keyName: Joi.string().allow('').required(),
  consumerGroups: Joi.array().items(Joi.string().label('consumerGroups').required().messages({
    'any.required': '{#label} should not be empty',
  })).required().min(1).messages({
    'array.sparse': 'each value in consumerGroups must be a string',
  }),
}).strict();

const validInputData = {
  keyName: constants.TEST_STREAM_KEY_1,
  consumerGroups: [constants.TEST_STREAM_GROUP_1],
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

describe('DELETE /instance/:instanceId/streams/consumer-groups', () => {
  beforeEach(async () => await rte.data.generateKeys(true));

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should delete consumer group',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          consumerGroups: [constants.TEST_STREAM_GROUP_1],
        },
        before: async () => {
          const groups = await rte.data.sendCommand('xinfo', ['groups', constants.TEST_STREAM_KEY_1]);
          expect(groups.length).to.eq(2);
        },
        after: async () => {
          const groups = await rte.data.sendCommand('xinfo', ['groups', constants.TEST_STREAM_KEY_1]);
          expect(groups.length).to.eq(1);
        },
      },
      {
        name: 'Should delete multiple consumer group',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          consumerGroups: [constants.TEST_STREAM_GROUP_1, constants.TEST_STREAM_GROUP_2],
        },
        before: async () => {
          const groups = await rte.data.sendCommand('xinfo', ['groups', constants.TEST_STREAM_KEY_1]);
          expect(groups.length).to.eq(2);
        },
        after: async () => {
          const groups = await rte.data.sendCommand('xinfo', ['groups', constants.TEST_STREAM_KEY_1]);
          expect(groups.length).to.eq(0);
        },
      },
      {
        name: 'Should delete single consumer group and ignore not existing',
        data: {
          keyName: constants.TEST_STREAM_KEY_1,
          consumerGroups: [constants.TEST_STREAM_GROUP_1, constants.getRandomString(), constants.getRandomString()],
        },
        before: async () => {
          const groups = await rte.data.sendCommand('xinfo', ['groups', constants.TEST_STREAM_KEY_1]);
          expect(groups.length).to.eq(2);
        },
        after: async () => {
          const groups = await rte.data.sendCommand('xinfo', ['groups', constants.TEST_STREAM_KEY_1]);
          expect(groups.length).to.eq(1);
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
        name: 'Should remove consumer group',
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
