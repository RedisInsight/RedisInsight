import { CloudAuthRequest } from 'src/modules/cloud/auth/models';
import { mockSessionMetadata } from 'src/__mocks__/common';

export const mockCloudAuthGoogleIdpConfig = {
  idpType: 'google',
  authorizeUrl: 'oauth2/authorize',
  tokenUrl: 'oauth2/token',
  issuer: 'https://authorization.server.com',
  clientId: 'cid_p6vA6A5tF36Jf6twH2cBOqtt7n',
  pkce: true,
  redirectUri: 'redisinsight:/cloud/oauth/callback',
  idp: 'idp_p6vA6A5tF36Jf6twH2cBOqtt7n',
  scopes: ['openid', 'email', 'profile'],
  responseMode: 'query',
  responseType: 'code',
};

export const mockCloudAuthGithubIdpConfig = {
  idpType: 'github',
};

export const mockCloudAuthGoogleTokenParams = {
  ...mockCloudAuthGoogleIdpConfig,
  state: 'state_p6vA6A5tF36Jf6twH2cBOqtt7n',
  nonce: 'nonce_p6vA6A5tF36Jf6twH2cBOqtt7n',
  ignoreSignature: false,
  codeVerifier: 'cv_p6vA6A5tF36Jf6twH2cBOqtt7n',
  codeChallenge: 'cch_p6vA6A5tF36Jf6twH2cBOqtt7n',
  codeChallengeMethod: 'S256',
};

export const mockCloudAuthGithubTokenParams = {
  ...mockCloudAuthGoogleTokenParams,
  idpType: 'github',
};

export const mockCloudAuthGoogleRequest = Object.assign(new CloudAuthRequest(), {
  ...mockCloudAuthGoogleTokenParams,
  sessionMetadata: {
    ...mockSessionMetadata,
  },
  tokenManager: { storage: {} },
  createdAt: new Date(),
});

export const mockCloudAuthGoogleAuthUrl = `${mockCloudAuthGoogleRequest.issuer}`
  + `/${mockCloudAuthGoogleRequest.authorizeUrl}`
  + `?client_id=${mockCloudAuthGoogleRequest.clientId}`
  + `&${new URLSearchParams({ redirect_uri: mockCloudAuthGoogleRequest.redirectUri }).toString()}`
  + `&response_type=${mockCloudAuthGoogleRequest.responseType}`
  + `&response_mode=${mockCloudAuthGoogleRequest.responseMode}`
  + `&idp=${mockCloudAuthGoogleRequest.idp}`
  + `&state=${mockCloudAuthGoogleRequest.state}`
  + `&nonce=${mockCloudAuthGoogleRequest.nonce}`
  + `&code_challenge_method=${mockCloudAuthGoogleRequest.codeChallengeMethod}`
  + `&code_challenge=${mockCloudAuthGoogleRequest.codeChallenge}`
  + `&${new URLSearchParams({ scope: mockCloudAuthGoogleRequest.scopes.join(' ') }).toString()}`;

export const mockAuthCode = 'code_p6vA6A5tF36Jf6twH2cBOqtt7n';

export const mockCloudAuthGoogleTokenUrl = `${mockCloudAuthGoogleRequest.issuer}`
  + `/${mockCloudAuthGoogleRequest.tokenUrl}`
  + `?client_id=${mockCloudAuthGoogleRequest.clientId}`
  + '&grant_type=authorization_code'
  + `&code=${mockAuthCode}`
  + `&code_verifier=${mockCloudAuthGoogleRequest.codeVerifier}`
  + `&${new URLSearchParams({ redirect_uri: mockCloudAuthGoogleRequest.redirectUri }).toString()}`
  + `&state=${mockCloudAuthGoogleRequest.state}`
  + `&nonce=${mockCloudAuthGoogleRequest.nonce}`
  + `&idp=${mockCloudAuthGoogleRequest.idp}`;

export const mockCloudAuthGithubRequest = Object.assign(new CloudAuthRequest(), {
  ...mockCloudAuthGithubTokenParams,
  sessionMetadata: {
    ...mockSessionMetadata,
  },
  tokenManager: { storage: {} },
  createdAt: new Date(),
});

export const mockOktaAuthClient = {
  token: {
    prepareTokenParams: jest.fn().mockResolvedValue(mockCloudAuthGoogleTokenParams),
  },
};
