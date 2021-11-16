import {
  expect,
  describe,
  it,
  before,
  deps,
  validateApiCall,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
import { Joi } from '../../helpers/test';

const { request, server, localDb, constants } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID_2) => request(server).patch(`/instance/${id}/name`);

// input data schema
const dataSchema = Joi.object({
  newName: Joi.string().max(500).required(),
}).messages({
  'any.required': '{#label} should not be empty',
}).strict();

const responseSchema = Joi.object().keys({
  oldName: Joi.string().required(),
  newName: Joi.string().required(),
}).required();

const validInputData = {
  newName: 'new name',
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

describe('PATCH /instance/:id/name', () => {
  before(async () => await localDb.createDatabaseInstances());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should change name for existing database',
        data: validInputData,
        responseSchema,
        before: async () => {
          const instance = await localDb.getInstanceById(constants.TEST_INSTANCE_ID_2);

          expect(instance.name).to.eql(constants.TEST_INSTANCE_NAME_2)
        },
        responseBody: {
          oldName: constants.TEST_INSTANCE_NAME_2,
          newName: validInputData.newName,
        },
        after: async () => {
          const instance = await localDb.getInstanceById(constants.TEST_INSTANCE_ID_2);

          expect(instance.name).to.eql('new name');
        },
      },
      {
        name: 'Should return Not Found Error',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: validInputData,
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
