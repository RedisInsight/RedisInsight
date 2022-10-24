import {
  Joi,
  expect,
  describe,
  it,
  deps,
  requirements,
  validateApiCall,
  after,
  generateInvalidDataTestCases, validateInvalidDataTestCase, getMainCheckFn
} from '../deps';
const { rte, request, server, localDb, constants } = deps;

const endpoint = () => request(server).post(`/sentinel/databases`);

// input data schema
const dataSchema = Joi.object({
  name: Joi.string().max(500).required(),
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  db: Joi.number().integer().allow(null),
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

const baseDatabaseData = {
  name: 'someName',
  host: constants.TEST_REDIS_HOST,
  port: constants.TEST_REDIS_PORT,
  username: constants.TEST_REDIS_USER || undefined,
  password: constants.TEST_REDIS_PASSWORD || undefined,
}

const baseSentinelData = {
  alias: constants.getRandomString(),
  name: constants.TEST_SENTINEL_MASTER_GROUP,
  username: constants.TEST_SENTINEL_MASTER_USER || null,
  password: constants.TEST_SENTINEL_MASTER_PASS || null,
}

const responseSchema = Joi.array().items(Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  status: Joi.string().required(),
  message: Joi.string().required(),
})).required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /sentinel/databases', () => {
  describe('Validation', function () {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );

    [
      {
        name: 'should deprecate to pass both cert id and other cert fields',
        data: {
          ...validInputData,
          caCert: {
            id: 'id',
            name: 'ca',
            certificate: 'ca_certificate',
          },
          clientCert: {
            id: 'id',
            name: 'client',
            certificate: 'client_cert',
            key: 'client_key',
          },
        },
        statusCode: 400,
        responseBody: {
          statusCode: 400,
          error: 'Bad Request',
        },
        checkFn: ({ body }) => {
          expect(body.message).to.contain('caCert.property name should not exist');
          expect(body.message).to.contain('caCert.property certificate should not exist');
          expect(body.message).to.contain('clientCert.property name should not exist');
          expect(body.message).to.contain('clientCert.property certificate should not exist');
          expect(body.message).to.contain('clientCert.property key should not exist');
        },
      },
    ].map(mainCheckFn);
  });
  describe('SENTINEL', () => {
    requirements('rte.type=SENTINEL');
    describe('PASS', function () {
      requirements('!rte.tls', 'rte.pass');
      it('Create sentinel with password', async () => {
        const dbName = constants.getRandomString();

        // preconditions
        expect(await localDb.getInstanceByName(dbName)).to.eql(null);
        expect(await localDb.getInstanceByName(baseSentinelData.alias)).to.eql(null);

        await validateApiCall({
          endpoint,
          statusCode: 201,
          data: {
            ...baseDatabaseData,
            name: 'any',
            host: constants.TEST_REDIS_HOST,
            port: constants.TEST_REDIS_PORT,
            password: constants.TEST_REDIS_PASSWORD,
            masters: [{
              ...baseSentinelData,
              alias: dbName,
            }, {
              ...baseSentinelData,
            }],
          },
          responseSchema,
          checkFn: ({ body }) => {
            body.forEach((entry) => {
              expect(entry.id).to.be.a('string');
              expect(entry.name).to.eq(constants.TEST_SENTINEL_MASTER_GROUP);
              expect(entry.status).to.eq('success');
              expect(entry.message).to.eq('Added');
            });
          },
        });

        expect(await localDb.getInstanceByName(dbName)).to.be.an('object');
        expect(await localDb.getInstanceByName(baseSentinelData.alias)).to.be.an('object');
      });
      // todo: cover connection error for incorrect username/password
    });
    // todo: sentinel tls validation
  });
});
