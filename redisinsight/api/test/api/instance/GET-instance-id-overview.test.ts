import { describe, it, deps, validateApiCall, before, expect } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/instance/${instanceId}/overview`);

const responseSchema = Joi.object().keys({
  version: Joi.string().required(),
  totalKeys: Joi.number().integer().allow(null),
  usedMemory: Joi.number().integer().allow(null),
  connectedClients: Joi.number().allow(null),
  opsPerSecond: Joi.number().allow(null),
  networkInKbps: Joi.number().allow(null),
  networkOutKbps: Joi.number().integer().allow(null),
  cpuUsagePercentage: Joi.number().allow(null),
}).required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /instance/:instanceId/overview', () => {
  before(localDb.createDatabaseInstances);

  [
    {
      name: 'Should get database overview',
      responseSchema,
      checkFn: ({body}) => {
        expect(body.version).to.eql(rte.env.version);
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
