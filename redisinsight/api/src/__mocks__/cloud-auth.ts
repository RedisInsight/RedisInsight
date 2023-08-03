import { CloudAuthRequest, CloudAuthResponse, CloudAuthStatus } from 'src/modules/cloud/auth/models';
import { mockSessionMetadata } from 'src/__mocks__/common';

export const mockCloudAuthCode = 'ac_p6vA6A5tF36Jf6twH2cBOqtt7n';
export const mockCloudAccessToken = 'at_p6vA6A5tF36Jf6twH2cBOqtt7n';

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
  state: 'state_p6vA6A5tF36Jf6twH2cBOqtt7ngn',
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

export const mockCloudAuthGoogleTokenUrl = `${mockCloudAuthGoogleRequest.issuer}`
  + `/${mockCloudAuthGoogleRequest.tokenUrl}`
  + `?client_id=${mockCloudAuthGoogleRequest.clientId}`
  + '&grant_type=authorization_code'
  + `&code=${mockCloudAuthCode}`
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

export const mockCloudAuthGithubAuthUrl = `${mockCloudAuthGithubRequest.issuer}`
  + `/${mockCloudAuthGithubRequest.authorizeUrl}`
  + `?client_id=${mockCloudAuthGithubRequest.clientId}`
  + `&${new URLSearchParams({ redirect_uri: mockCloudAuthGithubRequest.redirectUri }).toString()}`
  + `&response_type=${mockCloudAuthGithubRequest.responseType}`
  + `&response_mode=${mockCloudAuthGithubRequest.responseMode}`
  + `&idp=${mockCloudAuthGithubRequest.idp}`
  + `&state=${mockCloudAuthGithubRequest.state}`
  + `&nonce=${mockCloudAuthGithubRequest.nonce}`
  + `&code_challenge_method=${mockCloudAuthGithubRequest.codeChallengeMethod}`
  + `&code_challenge=${mockCloudAuthGithubRequest.codeChallenge}`
  + `&${new URLSearchParams({ scope: mockCloudAuthGithubRequest.scopes.join(' ') }).toString()}`;

export const mockTokenResponse = {
  access_token: mockCloudAccessToken,
};

export const mockCloudAuthGoogleCallbackQueryObject = {
  state: mockCloudAuthGoogleTokenParams.state,
  code: mockCloudAuthCode,
};

export const mockCloudAuthGithubCallbackQueryObject = {
  state: mockCloudAuthGithubTokenParams.state,
  code: mockCloudAuthCode,
};

export const mockCloudAuthResponse = Object.assign(new CloudAuthResponse(),{
  status: CloudAuthStatus.Succeed,
  message: 'Successfully authenticated',
});

export const mockCloudAuthFailedResponse = Object.assign(new CloudAuthResponse(),{
  status: CloudAuthStatus.Failed,
  message: 'Successfully authenticated',
});

export const mockOktaAuthClient = {
  token: {
    prepareTokenParams: jest.fn().mockResolvedValue(mockCloudAuthGoogleTokenParams),
  },
};

export const mockGithubIdpCloudAuthStrategy = jest.fn(() => ({
  generateAuthRequest: jest.fn().mockResolvedValue(mockCloudAuthGithubRequest),
}));

export const mockGoogleIdpCloudAuthStrategy = jest.fn(() => ({
  generateAuthRequest: jest.fn().mockResolvedValue(mockCloudAuthGoogleRequest),
}));

export const mockCloudAuthAnalytics = jest.fn(() => ({
  sendCloudSignInSucceeded: jest.fn(),
  sendCloudSignInFailed: jest.fn(),
}));
