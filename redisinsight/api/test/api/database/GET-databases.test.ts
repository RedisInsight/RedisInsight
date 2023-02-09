import { describe, expect, it, deps, validateApiCall, before, _, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants, rte } = deps;

const endpoint = () =>
  request(server).get(`/${constants.API.DATABASES}`);

const responseSchema = Joi.array().items(Joi.object().keys({
  id: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  db: Joi.number().integer().allow(null).required(),
  name: Joi.string().required(),
  provider: Joi.string().required(),
  new: Joi.boolean().allow(null).required(),
  timeout: Joi.number().integer().required(),
  connectionType: Joi.string().valid('STANDALONE', 'SENTINEL', 'CLUSTER', 'NOT CONNECTED').required(),
  lastConnection: Joi.string().isoDate().allow(null).required(),
  modules: Joi.array().items(Joi.object().keys({
    name: Joi.string().required(),
    version: Joi.number().integer().required(),
    semanticVersion: Joi.string(),
  })).min(0).required(),
})).required().strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

describe(`GET /databases`, () => {
  before(async () => {
    await localDb.createDatabaseInstances();
    // initializing modules list when ran as standalone test
    await request(server).get(`/databases/${constants.TEST_INSTANCE_ID}/connect`);
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
