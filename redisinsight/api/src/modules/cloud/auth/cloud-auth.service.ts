import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GoogleIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/google-idp.cloud.auth-strategy';
import { CloudAuthIdpType, CloudAuthRequest } from 'src/modules/cloud/auth/models/cloud-auth-request';
import { CloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/cloud-auth.strategy';
import { SessionMetadata } from 'src/common/models';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { GithubIdpCloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/github-idp.cloud.auth-strategy';
import { wrapHttpError } from 'src/common/utils';
import {
  CloudOauthGithubEmailPermissionException,
  CloudOauthMisconfigurationException,
  CloudOauthUnknownAuthorizationRequestException,
} from 'src/modules/cloud/auth/exceptions';
import { CloudAuthResponse, CloudAuthStatus } from 'src/modules/cloud/auth/models';

@Injectable()
export class CloudAuthService {
  private readonly logger = new Logger('CloudAuthService');

  private authRequests: Map<string, CloudAuthRequest> = new Map();

  constructor(
    private readonly sessionService: CloudSessionService,
    private readonly googleIdpAuthStrategy: GoogleIdpCloudAuthStrategy,
    private readonly githubIdpCloudAuthStrategy: GithubIdpCloudAuthStrategy,
  ) {}

  static getAuthorizationServerRedirectError(query: { errorDescription: string }) {
    if (query?.errorDescription?.includes('missing%3A+%27email')) {
      return new CloudOauthGithubEmailPermissionException();
    }

    return new CloudOauthMisconfigurationException();
  }

  getAuthStrategy(strategy: CloudAuthIdpType): CloudAuthStrategy {
    switch (strategy) {
      case CloudAuthIdpType.Google:
        return this.googleIdpAuthStrategy;
      case CloudAuthIdpType.GitHub:
        return this.githubIdpCloudAuthStrategy;
      default:
        throw new Error('Unknown cloud auth strategy');
    }
  }

  // todo: delete. needed for manual tests during development
  async oauth(sessionMetadata: SessionMetadata, strategy: CloudAuthIdpType): Promise<string> {
    return this.getAuthorizationUrl(sessionMetadata, strategy);
  }

  /**
   * Returns authorization url to open in the native browser to initialize oauth flow
   * @param sessionMetadata
   * @param strategy
   * @param callback
   */
  async getAuthorizationUrl(
    sessionMetadata: SessionMetadata,
    strategy: CloudAuthIdpType,
    callback?: Function,
  ): Promise<string> {
    const authRequest: any = await this.getAuthStrategy(strategy).generateAuthRequest(sessionMetadata);
    authRequest.callback = callback;

    // based on requirements we must support only single auth request at the moment
    // and logout user before
    await this.logout(sessionMetadata);
    this.authRequests.clear();
    this.authRequests.set(authRequest.state, authRequest);

    return CloudAuthStrategy.generateAuthUrl(authRequest).toString();
  }

  /**
   * Exchange authorization code for a tokens
   * @param authRequest
   * @param code
   */
  private async exchangeCode(authRequest: CloudAuthRequest, code: string): Promise<any> {
    try {
      const tokenUrl = CloudAuthStrategy.generateExchangeCodeUrl(authRequest, code);

      const { data } = await axios.post(tokenUrl.toString().split('?')[0], tokenUrl.searchParams, {
        headers: {
          accept: 'application/json',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
        },
      });

      return data;
    } catch (e) {
      this.logger.error('Unable to exchange code', e);

      throw wrapHttpError(e);
    }
  }

  /**
   * Handle oauth callback
   * Exchanges code and mofidy user session
   * Generates proper errors
   * @param query
   */
  private async callback(query): Promise<Function | void> {
    if (!this.authRequests.has(query?.state)) {
      throw new CloudOauthUnknownAuthorizationRequestException();
    }

    if (query?.error) {
      throw CloudAuthService.getAuthorizationServerRedirectError(query);
    }

    const authRequest = this.authRequests.get(query.state);

    // delete authRequest on this step
    // allow to redirect with authorization code only once
    this.authRequests.delete(query.state);

    const tokens = await this.exchangeCode(authRequest, query.code);

    await this.sessionService.updateSessionData(authRequest.sessionMetadata.sessionId, {
      accessToken: tokens.access_token,
    });

    return authRequest.callback;
  }

  async callbackIpc(query): Promise<CloudAuthResponse> {
    try {
      await this.callback(query);

      return {
        status: CloudAuthStatus.Succeed,
        message: 'Successfully authenticated',
      };
    } catch (e) {
      return {
        status: CloudAuthStatus.Failed,
        error: wrapHttpError(e).getResponse(),
      };
    }
  }

  async callbackWeb(query): Promise<CloudAuthResponse> {
    let result: CloudAuthResponse = {
      status: CloudAuthStatus.Succeed,
      message: 'Successfully authenticated',
    };

    let callback;

    try {
      callback = await this.callback(query);
    } catch (e) {
      result = {
        status: CloudAuthStatus.Failed,
        error: wrapHttpError(e).getResponse(),
      };
    }

    try {
      callback?.(result);
    } catch (e) {
      this.logger.error('Callback failed');
    }

    return result;
  }

  /**
   * Logout user
   * Basically cleans current user session
   * @param sessionMetadata
   */
  async logout(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      this.logger.log('Logout cloud user');
      await this.sessionService.deleteSessionData(sessionMetadata.sessionId);
    } catch (e) {
      this.logger.error('Unable to logout', e);
      throw wrapHttpError(e);
    }
  }
}
