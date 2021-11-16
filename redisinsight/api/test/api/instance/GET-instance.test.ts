import { describe, expect, it, deps, validateApiCall, before, _ } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants, rte } = deps;

const endpoint = () =>
  request(server).get(`/instance`);

const responseSchema = Joi.array().items(Joi.object().keys({
  id: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  db: Joi.number().integer().allow(null),
  name: Joi.string().required(),
  username: Joi.string().allow(null).required(),
  password: Joi.string().allow(null).required(),
  connectionType: Joi.string().valid('STANDALONE', 'SENTINEL', 'CLUSTER').required(),
  nameFromProvider: Joi.string().allow(null).required(),
  lastConnection: Joi.date().allow(null).required(),
  provider: Joi.string().required(),
  tls: Joi.object().keys({
    verifyServerCert: Joi.boolean().required(),
    caCertId: Joi.string(),
    clientCertPairId: Joi.string(),
  }),
  sentinelMaster: Joi.object().keys({
    name: Joi.string().required(),
    username: Joi.string().allow(null).required(),
    password: Joi.string().allow(null).required(),
  }),
  endpoints: Joi.array().items(Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().required(),
  })),
  modules: Joi.array().items(Joi.object().keys({
    name: Joi.string().required(),
    version: Joi.number().integer().required(),
    semanticVersion: Joi.string(),
  })).min(0).required(),
})).required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /instance', () => {
  before(async () => {
    await localDb.createDatabaseInstances();
    // initializing modules list when ran as standalone test
    await request(server).get(`/instance/${constants.TEST_INSTANCE_ID}/connect`);
  });

  [
    {
      name: 'Should get instances list',
      responseSchema,
      checkFn: ({ body }) => {
        const instance = _.find(body, { id: constants.TEST_INSTANCE_ID })
        _.map(rte.env.modules, (module, name) => {
          expect(_.find(instance.modules, module => module.name.toLowerCase() === name).version)
            .to.eql(module.version);
        })
      }
    },
  ].map(mainCheckFn);
});
