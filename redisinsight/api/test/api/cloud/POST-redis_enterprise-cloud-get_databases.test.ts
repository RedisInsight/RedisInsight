import {
  describe,
  it,
  before,
  deps,
  validateApiCall,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  expect,
  _,
  Joi,
} from '../deps';
const { request, server, constants } = deps;

const endpoint = () => request(server).post(`/redis-enterprise/cloud/get-databases`);

const dataSchema = Joi.object({
  apiKey: Joi.string().required(),
  apiSecretKey: Joi.string().required(),
  subscriptionIds: Joi.number().allow(true).required(), // todo: review transform rules
}).strict();

const validInputData = {
  apiKey: constants.TEST_CLOUD_API_KEY,
  apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
  subscriptionIds: 1
}

const responseSchema = Joi.array().items(Joi.object().keys({
  subscriptionId: Joi.number().required(),
  databaseId: Joi.number().required(),
  name: Joi.string().required(),
  publicEndpoint: Joi.string().required(),
  status: Joi.string().required(),
  sslClientAuthentication: Joi.boolean().required(),
  modules: Joi.array().required(),
  options: Joi.object().required(),
})).required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('POST /redis-enterprise/cloud/get-databases', () => {
  requirements('rte.cloud');

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', async () => {
    [
      {
        name: 'Should get databases list inside subscription',
        data: {
          apiKey: constants.TEST_CLOUD_API_KEY,
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
          subscriptionIds: [constants.TEST_CLOUD_SUBSCRIPTION_ID]
        },
        responseSchema,
        checkFn: ({ body }) => {
          const database = _.find(body, { name: constants.TEST_CLOUD_DATABASE_NAME });
          expect(database.publicEndpoint).to.eql(`${constants.TEST_REDIS_HOST}:${constants.TEST_REDIS_PORT}`);
        },
      },
      {
        name: 'Should throw Forbidden error when api key is incorrect',
        data: {
          apiKey: 'wrong-api-key',
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
          subscriptionIds: [constants.TEST_CLOUD_SUBSCRIPTION_ID]
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
      },
      {
        name: 'Should throw Forbidden error when api secret key is incorrect',
        data: {
          apiKey: constants.TEST_CLOUD_API_KEY,
          apiSecretKey: 'wrong-api-secret-key',
          subscriptionIds: [constants.TEST_CLOUD_SUBSCRIPTION_ID]
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
      },
      {
        name: 'Should throw Not Found error when subscription id is not found',
        data: {
          apiKey: constants.TEST_CLOUD_API_KEY,
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
          subscriptionIds: [1]
        },
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found',
        },

      },
    ].map(mainCheckFn);
  });
});
