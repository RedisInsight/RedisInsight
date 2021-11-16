import {
  Joi,
  expect,
  describe,
  it,
  before,
  deps,
  validateApiCall,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';

const { request, server, localDb, constants } = deps;

const endpoint = () => request(server).delete(`/instance`);

// input data schema
const dataSchema = Joi.object({
  ids: Joi.array().items(Joi.any()).required(),
}).strict();

const validInputData = {
  ids: [constants.getRandomString()],
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

describe('DELETE /instance', () => {
  before(async () => await localDb.createDatabaseInstances());

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should remove multiple databases by ids',
        data: {
          ids: [constants.TEST_INSTANCE_ID_2, constants.TEST_INSTANCE_ID_3]
        },
        responseBody: {
          affected: 2,
        },
        before: async () => {
          expect(await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2)).to.not.eql(undefined)
          expect(await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_3)).to.not.eql(undefined)
        },
        after: async () => {
          expect(await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2)).to.eql(undefined)
          expect(await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_3)).to.eql(undefined)
        },
      },
      {
        name: 'Should return affected 0 since no databases found',
        data: {
          ids: [constants.TEST_INSTANCE_ID_2, constants.TEST_INSTANCE_ID_3]
        },
        responseBody: {
          affected: 0,
        },
        before: async () => {
          expect(await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2)).to.eql(undefined)
          expect(await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_3)).to.eql(undefined)
        },
      },
    ].map(mainCheckFn);
  });
});
