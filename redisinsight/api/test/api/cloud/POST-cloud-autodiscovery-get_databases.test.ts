import {
  describe,
  deps,
  expect,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  Joi, getMainCheckFn, serverConfig
} from '../deps';
import { nock } from '../../helpers/test';
import { mockCloudApiDatabases, mockCloudDatabaseFromList } from 'src/__mocks__/cloud-autodiscovery';
const { request, server, constants } = deps;

const endpoint = () => request(server).post(`/cloud/autodiscovery/get-databases`);

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

const mainCheckFn = getMainCheckFn(endpoint);

const nockScope = nock(serverConfig.get('redis_cloud').url);

describe('POST /cloud/subscriptions/get-databases', () => {
  requirements('rte.serverType=local');

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', async () => {
    [
      {
        before: () => {
          nockScope.get(`/subscriptions/${constants.TEST_CLOUD_SUBSCRIPTION_ID}/databases`)
            .reply(200, mockCloudApiDatabases);
        },
        name: 'Should get databases list inside subscription',
        data: {
          apiKey: constants.TEST_CLOUD_API_KEY,
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
          subscriptionIds: [constants.TEST_CLOUD_SUBSCRIPTION_ID]
        },
        responseSchema,
        checkFn: ({ body }) => {

          expect(body).to.deep.eq([mockCloudDatabaseFromList]);
        },
      },
      {
        before: () => {
          nockScope.get(`/subscriptions/${constants.TEST_CLOUD_SUBSCRIPTION_ID}/databases`)
            .reply(403, {
              response: {
                status: 403,
                data: { message: 'Unauthorized for this action' },
              }
            });
        },
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
        before: () => {
          nockScope.get(`/subscriptions/${constants.TEST_CLOUD_SUBSCRIPTION_ID}/databases`)
            .reply(401, {
              response: {
                status: 401,
                data: '',
              }
            });
        },
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
        before: () => {
          nockScope.get(`/subscriptions/${constants.TEST_CLOUD_SUBSCRIPTION_ID}/databases`)
            .reply(404, {
              response: {
                status: 404,
                data: 'Subscription is not found',
              }
            });
        },
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
