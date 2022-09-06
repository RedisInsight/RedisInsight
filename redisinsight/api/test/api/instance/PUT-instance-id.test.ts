import {
  expect,
  describe,
  it,
  before,
  deps,
  validateApiCall, generateInvalidDataTestCases, validateInvalidDataTestCase, requirements
} from '../deps';
import { Joi } from '../../helpers/test';

const { request, server, localDb, constants } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID_2) => request(server).put(`/instance/${id}`);

// input data schema
const dataSchema = Joi.object({
  name: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number().integer().allow(true).required(),
}).messages({
  'any.required': '{#label} should not be empty',
}).strict();

const validInputData = {
  name: constants.getRandomString(),
  host: constants.getRandomString(),
  port: 111,
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

describe('PUT /instance/:id', () => {
  requirements('rte.type=STANDALONE', '!rte.pass', '!rte.tls');
  before(async () => await localDb.createDatabaseInstances());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should change data for existing database',
        data: {
          name: 'new name',
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
        },
        before: async () => {
          expect(await localDb.getInstanceByName('new name')).to.eql(null)
        },
        after: async () => {
          const newDb = await localDb.getInstanceByName('new name');
          expect(newDb.name).to.eql('new name');
          expect(newDb.host).to.eql(constants.TEST_REDIS_HOST);
          expect(newDb.port).to.eql(constants.TEST_REDIS_PORT);
        },
      },
      {
        name: 'Should return 503 error if incorrect connection data provided',
        data: {
          name: 'new name',
          host: constants.TEST_REDIS_HOST,
          port: 1111,
        },
        statusCode: 503,
        responseBody: {
          statusCode: 503,
          message: `Could not connect to ${constants.TEST_REDIS_HOST}:1111, please check the connection details.`,
          error: 'Service Unavailable'
        },
        after: async () => {
          // check that instance wasn't changed
          const newDb = await localDb.getInstanceByName('new name');
          expect(newDb.name).to.eql('new name');
          expect(newDb.host).to.eql(constants.TEST_REDIS_HOST);
          expect(newDb.port).to.eql(constants.TEST_REDIS_PORT);
        },
      },
      {
        name: 'Should return Not Found Error',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: {
          name: 'new name',
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found'
        },
      },
    ].map(mainCheckFn);
  });
});
