import {
  expect,
  describe,
  it,
  before,
  deps,
  validateApiCall,
} from '../deps';

const { request, server, localDb, constants } = deps;

const endpoint = id => request(server).delete(`/instance/${id}`);

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

describe('DELETE /instance/:id', () => {
  before(async () => await localDb.createDatabaseInstances());

  describe('Common', () => {
    [
      {
        name: 'Should remove single database',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
        before: async () => {
          expect(await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2)).to.be.an('object')
        },
        after: async () => {
          expect(await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2)).to.eql(null)
        },
      },
      {
        name: 'Should return Not Found Error',
        endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found'
        },
        before: async () => {
          expect(await localDb.getInstanceByName(constants.TEST_INSTANCE_NAME_2)).to.eql(null)
        },
      },
    ].map(mainCheckFn);
  });
});
