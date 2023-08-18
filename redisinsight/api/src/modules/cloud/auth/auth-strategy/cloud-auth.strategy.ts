import { Injectable } from '@nestjs/common';
import { CloudAuthRequest } from 'src/modules/cloud/auth/models/cloud-auth-request';
import { SessionMetadata } from 'src/common/models';
import { OktaAuth } from '@okta/okta-auth-js';
import { plainToClass } from 'class-transformer';

@Injectable()
export abstract class CloudAuthStrategy {
  protected config;

  /**
   * Create and store auth request params
   */
  async generateAuthRequest(sessionMetadata: SessionMetadata): Promise<CloudAuthRequest> {
    const authClient = new OktaAuth(this.config);
    const tokenParams = await authClient.token.prepareTokenParams(this.config);

    return plainToClass(CloudAuthRequest, {
      ...this.config,
      ...tokenParams,
      sessionMetadata,
      createdAt: new Date(),
    });
  }

  static generateAuthUrl(authRequest: any): URL {
    const url = new URL(authRequest.authorizeUrl, authRequest.issuer);
    url.searchParams.append('client_id', authRequest.clientId);
    url.searchParams.append('redirect_uri', authRequest.redirectUri);
    url.searchParams.append('response_type', authRequest.responseType);
    url.searchParams.append('response_mode', authRequest.responseMode);
    url.searchParams.append('idp', authRequest.idp);
    url.searchParams.append('state', authRequest.state);
    url.searchParams.append('nonce', authRequest.nonce);
    url.searchParams.append('code_challenge_method', authRequest.codeChallengeMethod);
    url.searchParams.append('code_challenge', authRequest.codeChallenge);
    url.searchParams.append('scope', authRequest.scopes.join(' '));

    return url;
  }

  static generateExchangeCodeUrl(authRequest: any, code: string): URL {
    const url = new URL(authRequest.tokenUrl, authRequest.issuer);
    url.searchParams.append('client_id', authRequest.clientId);
    url.searchParams.append('grant_type', 'authorization_code');
    url.searchParams.append('code', code);
    url.searchParams.append('code_verifier', authRequest.codeVerifier);
    url.searchParams.append('redirect_uri', authRequest.redirectUri);
    url.searchParams.append('state', authRequest.state);
    url.searchParams.append('nonce', authRequest.nonce);
    url.searchParams.append('idp', authRequest.idp);

    return url;
  }
}
