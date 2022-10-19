import { describe, it, deps, validateApiCall, before, expect, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants, rte } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${id}/info`);

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
}).required().strict();

const mainCheckFn = getMainCheckFn(endpoint);

describe(`GET /${constants.API.DATABASES}/:id/info`, () => {
  before(localDb.createDatabaseInstances);

  [
    {
      name: 'Should get database info',
      responseSchema,
      checkFn: ({body}) => {
        expect(body.version).to.eql(rte.env.version);
      }
    },
    {
      endpoint: () => endpoint(constants.TEST_INSTANCE_ID_2),
      name: 'Should not get info due to misconfiguration',
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
