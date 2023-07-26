import { nock, serverConfig } from '../../helpers/test';
import { mockCloudApiAccount, mockCloudApiCsrfToken, mockCloudApiUser } from 'src/__mocks__';

export const initApiLoginNockScope = (
  apiNockScope = nock(serverConfig.get('cloud').apiUrl),
) => {
  return apiNockScope
    .post('/login').query(true)
    .reply(200, {}, { 'set-cookie': 'JSESSIONID=jsessionid' })
    .get('/csrf')
    .reply(200, { csrfToken: mockCloudApiCsrfToken });
}

export const initApiUserProfileNockScope = (
  apiNockScope = nock(serverConfig.get('cloud').apiUrl),
) => {
  return initApiLoginNockScope(apiNockScope)
    .get('/users/me')
    .reply(200, mockCloudApiUser)
    .get('/accounts')
    .reply(200, { accounts: [mockCloudApiAccount] });
}

export const initApiCapiKeysEnsureNockScope = (
  apiNockScope = nock(serverConfig.get('cloud').apiUrl),
) => {
  return initApiLoginNockScope(apiNockScope)
    .get('/users/me')
    .reply(200, mockCloudApiUser)
    .get('/accounts')
    .reply(200, { accounts: [mockCloudApiAccount] });
}
