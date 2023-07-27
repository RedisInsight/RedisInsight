import { nock, serverConfig } from '../../helpers/test';
import { mockCloudApiAccount, mockCloudApiCapiKey, mockCloudApiCsrfToken, mockCloudApiUser } from 'src/__mocks__';

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
  return initApiUserProfileNockScope(apiNockScope)
    .get('/accounts/cloud-api/cloudApiKeys')
    .reply(200, { cloudApiKeys: [] })
    .post('/accounts/cloud-api/cloudApiKeys')
    .reply(200, { cloudApiKey: mockCloudApiCapiKey });
}
