import {
  describe,
  it,
  deps,
  validateApiCall,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  Joi,
} from '../deps';
const { request, server, constants } = deps;

const endpoint = () => request(server).post(`/redis-enterprise/cloud/get-account`);

const dataSchema = Joi.object({
  apiKey: Joi.string().required(),
  apiSecretKey: Joi.string().required(),
}).strict();

const validInputData = {
  apiKey: constants.TEST_CLOUD_API_KEY,
  apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
}

const responseSchema = Joi.object().keys({
  accountId: Joi.number().required(),
  accountName: Joi.string().required(),
  ownerName: Joi.string().required(),
  ownerEmail: Joi.string().required(),
}).required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('POST /redis-enterprise/cloud/get-account', () => {
  requirements('rte.cloud');

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should get account info',
        data: {
          apiKey: constants.TEST_CLOUD_API_KEY,
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
        },
        responseSchema,
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
