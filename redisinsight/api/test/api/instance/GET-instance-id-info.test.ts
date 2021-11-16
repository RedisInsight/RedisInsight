import { describe, it, deps, validateApiCall, before, expect } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/instance/${instanceId}/info`);

const responseSchema = Joi.object().keys({
  version: Joi.string().required(),
  databases: Joi.number().integer(),
  role: Joi.string(),
  totalKeys: Joi.number().integer().required(),
  usedMemory: Joi.number().integer().required(),
  connectedClients: Joi.number().integer(),
  uptimeInSeconds: Joi.number().integer(),
  hitRatio: Joi.number(),
  server: Joi.object(),
  nodes: Joi.array().items(Joi.object().keys({
    version: Joi.string().required(),
    databases: Joi.number().integer().required(),
    role: Joi.string().required(),
    totalKeys: Joi.number().integer().required(),
    usedMemory: Joi.number().integer().required(),
    connectedClients: Joi.number().integer().required(),
    uptimeInSeconds: Joi.number().integer().required(),
    hitRatio: Joi.number().required(),
    server: Joi.object().required(),
  })),
}).required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /instance/:instanceId/info', () => {
  before(localDb.createDatabaseInstances);

  [
    {
      name: 'Should connect to a database',
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
