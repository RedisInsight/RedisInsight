import {
  mockCloudUserAccount,
  mockCloudUserSafe
} from 'src/__mocks__';
import {
  describe,
  deps,
  requirements,
  Joi,
  getMainCheckFn,
  expect,
} from '../../deps';
import { initApiUserProfileNockScope } from '../constants';

const { request, server } = deps;

const endpoint = (account = mockCloudUserAccount.id) => request(server).put(`/cloud/me/accounts/${account}/current`);

const responseSchema = Joi.object().keys({
  id: Joi.number().required(),
  name: Joi.string().required(),
  currentAccountId: Joi.number().required(),
  accounts: Joi.array().items(Joi.object().keys({
    id: Joi.number().required(),
    name: Joi.string().required(),
  })).required(),
}).required();

const mainCheckFn = getMainCheckFn(endpoint);

const apiNockScope = initApiUserProfileNockScope();

describe('PUT /cloud/me/accounts/:id/current', () => {
  requirements('rte.serverType=local');

  describe('Common', () => {
    [
      {
        before: () => {
          apiNockScope
            .post(`/accounts/setcurrent/${mockCloudUserAccount.id}`)
            .reply(200, {})
        },
        name: 'Should get user profile',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.deep.eq(mockCloudUserSafe);
        },
      },
    ].map(mainCheckFn);
  });
});
