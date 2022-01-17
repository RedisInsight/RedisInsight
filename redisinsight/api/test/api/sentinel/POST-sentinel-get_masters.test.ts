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
} from '../deps';
const { request, server, constants, localDb } = deps;

const endpoint = () => request(server).post('/sentinel/get-masters');
const mainCheckFn = getMainCheckFn(endpoint);

// input data schema
const dataSchema = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().required().allow(true), // todo: rework server transformer to not handle true like number:1
  username: Joi.string().allow(null),
  password: Joi.string().allow(null),
  tls: Joi.object({
    verifyServerCert: Joi.any(), // todo: rework server validation to not handle any value like boolean:true
    caCertId: Joi.string().allow(null),
    clientCertPairId: Joi.string().allow(null),
    newCaCert: Joi.object({
      name: Joi.string(),
      cert: Joi.string(),
    }).allow(null),
    newClientCertPair: Joi.object({
      name: Joi.string(),
      key: Joi.string(),
      cert: Joi.string(),
    }).allow(null),
  }).allow(null),
}).messages({
  'any.required': '{#label} should not be empty',
}).strict();

const responseSchema = Joi.array().items(Joi.object().keys({
  host: Joi.string().required(),
  port: Joi.number().required(),
  name: Joi.string().required(),
  status: Joi.string().required(),
  numberOfSlaves: Joi.number().required(),
  endpoints: Joi.array().items(Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
  })).required(),
}));

const validInputData = {
  host: constants.TEST_REDIS_HOST,
  port: constants.TEST_REDIS_PORT,
};
describe('POST /sentinel/get-masters', () => {
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
          expect(body.length).to.eql(1);
          expect(body[0].name).to.eql(constants.TEST_SENTINEL_MASTER_GROUP);
          expect(body[0].endpoints).to.eql([
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
