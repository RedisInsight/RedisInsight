import {
  describe,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  Joi, getMainCheckFn, serverConfig
} from '../deps';
import { nock } from '../../helpers/test';
import { mockCloudApiSubscription, mockCloudSubscription } from 'src/__mocks__/cloud-autodiscovery';
const { request, server, constants } = deps;

const endpoint = () => request(server).post(`/cloud/autodiscovery/get-subscriptions`);

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

const mainCheckFn = getMainCheckFn(endpoint);

const nockScope = nock(serverConfig.get('redis_cloud').url);

describe('POST /cloud/autodiscovery/get-subscriptions', () => {
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
          nockScope.get('/subscriptions')
            .reply(200, { subscriptions: [mockCloudApiSubscription] });
        },
        name: 'Should get subscriptions list',
        data: {
          apiKey: constants.TEST_CLOUD_API_KEY,
          apiSecretKey: constants.TEST_CLOUD_API_SECRET_KEY,
        },
        responseSchema,
        responseBody: [mockCloudSubscription],
      },
      {
        before: () => {
          nockScope.get('/subscriptions')
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
          nockScope.get('/subscriptions')
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
