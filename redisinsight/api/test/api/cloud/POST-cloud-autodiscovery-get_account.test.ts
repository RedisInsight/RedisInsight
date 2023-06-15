import {
  describe,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  Joi,
  nock, getMainCheckFn,
  serverConfig,
} from '../deps';
import { mockCloudAccountInfo, mockCloudApiAccount } from 'src/__mocks__/cloud-autodiscovery';
const { request, server, constants } = deps;

const endpoint = () => request(server).post(`/cloud/autodiscovery/get-account`);

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

const mainCheckFn = getMainCheckFn(endpoint);

const nockScope = nock(serverConfig.get('redis_cloud').url);

describe('POST /cloud/autodiscovery/get-account', () => {
  requirements('rte.serverType=local');

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        before: () => {
          nockScope.get('/')
            .reply(200, { account: mockCloudApiAccount });
        },
        name: 'Should get account info',
        data: {
          apiKey: constants.TEST_CLOUD_API_KEY,
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
        },
        responseSchema,
        responseBody: mockCloudAccountInfo,
      },
      {
        before: () => {
          nockScope.get('/')
            .reply(403, {
              response: {
                status: 403,
                data: { message: 'Unauthorized for this action' },
              }
            });
        },
        name: 'Should throw Forbidden error when api returned unauthorized error',
        data: {
          apiKey: constants.TEST_CLOUD_API_KEY,
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
        },
        statusCode: 403,
        responseBody: {
          statusCode: 403,
          error: 'Forbidden',
        },
      },
      {
        before: () => {
          nockScope.get('/')
            .reply(401, {
              response: {
                status: 401,
                data: '',
              }
            });
        },
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
    ].map(mainCheckFn);
  });
});
