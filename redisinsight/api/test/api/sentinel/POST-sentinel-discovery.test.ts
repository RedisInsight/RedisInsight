import {
  Joi,
  expect,
  describe,
  after,
  deps,
  requirements,
  getMainCheckFn,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  _,
} from '../deps';
const { request, server, constants, localDb } = deps;

const endpoint = () => request(server).post('/sentinel/discovery');
const mainCheckFn = getMainCheckFn(endpoint);

// input data schema
const dataSchema = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  username: Joi.string().allow(null),
  password: Joi.string().allow(null),
  tls: Joi.boolean().allow(null),
  tlsServername: Joi.string().allow(null),
  verifyServerCert: Joi.boolean().allow(null),
}).messages({
  'any.required': '{#label} should not be empty',
}).strict(true);

const validInputData = {
  name: constants.getRandomString(),
  host: constants.getRandomString(),
  port: 111,
};

const responseSchema = Joi.array().items(Joi.object().keys({
  host: Joi.string().required(),
  port: Joi.number().required(),
  name: Joi.string().required(),
  status: Joi.string().required(),
  numberOfSlaves: Joi.number().required(),
  nodes: Joi.array().items(Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
  })).required(),
}));

describe('POST /sentinel/discovery', () => {
  requirements('rte.type=SENTINEL');
  after(localDb.initAgreements);

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Get list of master groups',
        data: {
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
          username: constants.TEST_REDIS_USER,
          password: constants.TEST_REDIS_PASSWORD,
        },
        responseSchema,
        checkFn: async ({body}) => {
          expect(body.length).to.gte(1);
          const sentinelMaster = _.find(body, ({ name }) => name === constants.TEST_SENTINEL_MASTER_GROUP);
          expect(sentinelMaster.nodes).to.eql([
            {
              host: constants.TEST_REDIS_HOST,
              port: constants.TEST_REDIS_PORT,
            },
          ]);
        },
      },

    ].map(mainCheckFn);
  });
});
