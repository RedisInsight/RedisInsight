import {
  expect,
  describe,
  before,
  deps,
  getMainCheckFn,
} from '../deps';

const { request, server, localDb, constants } = deps;

const endpoint = id => request(server).delete(`/${constants.API.DATABASES}/${id}`);

const mainCheckFn = getMainCheckFn(endpoint);

describe(`DELETE /${constants.API.DATABASES}/:id`, () => {
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
