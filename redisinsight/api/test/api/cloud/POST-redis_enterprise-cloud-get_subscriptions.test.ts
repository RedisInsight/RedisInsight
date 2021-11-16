import {
  describe,
  it,
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

const endpoint = () => request(server).post(`/redis-enterprise/cloud/get-subscriptions`);

const dataSchema = Joi.object({
  apiKey: Joi.string().required(),
  apiSecretKey: Joi.string().required(),
}).strict();

const validInputData = {
  apiKey: constants.TEST_CLOUD_API_KEY,
  apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
}

const responseSchema = Joi.array().items(Joi.object().keys({
  id: Joi.number().required(),
  name: Joi.string().required(),
  numberOfDatabases: Joi.number().required(),
  status: Joi.string().required(),
  provider: Joi.string(),
  region: Joi.string(),
})).required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('POST /redis-enterprise/cloud/get-subscriptions', () => {
  requirements('rte.cloud');

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should get subscriptions list',
        data: {
          apiKey: constants.TEST_CLOUD_API_KEY,
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
        },
        responseSchema,
        checkFn: ({ body }) => {
          expect(_.findIndex(body, { name: constants.TEST_CLOUD_SUBSCRIPTION_NAME })).to.gte(0);
        },
      },
      {
        name: 'Should throw Forbidden error when api key is incorrect',
        data: {
          apiKey: 'wrong-api-key',
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
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
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },

      },
    ].map(mainCheckFn);
  });
});
