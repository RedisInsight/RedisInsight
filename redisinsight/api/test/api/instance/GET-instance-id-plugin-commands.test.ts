import { describe, it, deps, validateApiCall, before, expect } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/instance/${instanceId}/plugin-commands`);

const responseSchema = Joi.array().items(Joi.string()).required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /instance/:instanceId/plugin-commands', () => {
  before(localDb.createDatabaseInstances);

  [
    {
      name: 'Should get plugin commands whitelist',
      responseSchema,
      checkFn: ({body}) => {
        expect(body).to.include('get');
        expect(body).to.not.include('role');
        expect(body).to.not.include('xread');
      }
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
