import { describe, it, deps, validateApiCall, before } from '../deps';
const { localDb, request, server, constants } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/instance/${instanceId}/connect`);


const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /instance/:instanceId/connect', () => {
  before(async () => await localDb.createDatabaseInstances());

  [
    {
      name: 'Should connect to a database',
      statusCode: 200,
    },
    {
      endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
      name: 'Should not connect to a database due to misconfiguration',
      statusCode: 503,
      responseBody: {
        statusCode: 503,
        error: 'Service Unavailable'
      },
    },
    {
      name: 'Should return NotFound error if instance id does not exists',
      endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
      statusCode: 404,
      responseBody: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Invalid database instance id.',
      },
    },
  ].map(mainCheckFn);
});
