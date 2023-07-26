import {
  describe,
  deps,
  requirements,
  Joi,
  nock, getMainCheckFn,
  serverConfig,
} from '../../deps';
import { mockCloudAccountInfo, mockCloudApiCsrfToken, mockCloudApiUser, mockCloudCapiAccount } from 'src/__mocks__';
import { CustomErrorCodes } from 'src/constants';
import { initApiUserProfileNockScope } from '../constants';
const { request, server, constants } = deps;

const endpoint = () => request(server).get(`/cloud/me/autodiscovery/account`);

const responseSchema = Joi.object().keys({
  accountId: Joi.number().required(),
  accountName: Joi.string().required(),
  ownerName: Joi.string().required(),
  ownerEmail: Joi.string().required(),
}).required();

const mainCheckFn = getMainCheckFn(endpoint);

const nockScope = nock(serverConfig.get('cloud').capiUrl);
const apiNockScope = initApiUserProfileNockScope();

xdescribe('GET /cloud/me/autodiscovery/account', () => {
  requirements('rte.serverType=local');

  describe('Common', () => {
    [
      {
        before: () => {
          nockScope.get('/')
            .reply(200, { account: mockCloudCapiAccount });
        },
        name: 'Should get account info',
        responseSchema,
        responseBody: mockCloudAccountInfo,
      },
      // {
      //   before: () => {
      //     nockScope.get('/')
      //       .reply(403, {
      //         response: {
      //           status: 403,
      //           data: { message: 'Unauthorized for this action' },
      //         }
      //       });
      //   },
      //   name: 'Should throw Forbidden error when api returned 403 error',
      //   statusCode: 403,
      //   responseBody: {
      //     statusCode: 403,
      //     error: 'CloudApiForbidden',
      //     errorCode: CustomErrorCodes.CloudApiForbidden,
      //   },
      // },
      // {
      //   before: () => {
      //     nockScope.get('/')
      //       .reply(401, {
      //         response: {
      //           status: 401,
      //           data: '',
      //         }
      //       });
      //   },
      //   name: 'Should throw Unauthorized error when api returns 401 error',
      //   statusCode: 401,
      //   responseBody: {
      //     statusCode: 401,
      //     error: 'CloudApiUnauthorized',
      //     errorCode: CustomErrorCodes.CloudApiUnauthorized,
      //   },
      // },
      // {
      //   name: 'Should throw Unauthorized error when api key or secret was not provided',
      //   headers: {},
      //   statusCode: 401,
      //   responseBody: {
      //     statusCode: 401,
      //     error: 'Unauthorized',
      //     message: 'Required authentication credentials were not provided',
      //   },
      // },
    ].map(mainCheckFn);
  });
});
