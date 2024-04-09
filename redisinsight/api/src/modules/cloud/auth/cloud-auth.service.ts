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
  CloudOauthMisconfigurationException, CloudOauthMissedRequiredDataException,
  CloudOauthUnknownAuthorizationRequestException,
} from 'src/modules/cloud/auth/exceptions';
import { CloudAuthRequestInfo, CloudAuthResponse, CloudAuthStatus } from 'src/modules/cloud/auth/models';
import { CloudAuthAnalytics } from 'src/modules/cloud/auth/cloud-auth.analytics';
import { CloudSsoFeatureStrategy } from 'src/modules/cloud/cloud-sso.feature.flag';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CloudAuthServerEvent } from 'src/modules/cloud/common/constants';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';

@Injectable()
export class CloudAuthService {
  private readonly logger = new Logger('CloudAuthService');

  private authRequests: Map<string, CloudAuthRequest> = new Map();

  constructor(
    private readonly sessionService: CloudSessionService,
    private readonly googleIdpAuthStrategy: GoogleIdpCloudAuthStrategy,
    private readonly githubIdpCloudAuthStrategy: GithubIdpCloudAuthStrategy,
    private readonly analytics: CloudAuthAnalytics,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  static getAuthorizationServerRedirectError(query: { error_description: string }) {
    if (query?.error_description?.indexOf('properties are missing') > -1) {
      return new CloudOauthMissedRequiredDataException(query.error_description, {
        description: query.error_description,
      });
    }

    return new CloudOauthMisconfigurationException(undefined, {
      description: query.error_description,
    });
  }

  getAuthStrategy(strategy: CloudAuthIdpType): CloudAuthStrategy {
    switch (strategy) {
      case CloudAuthIdpType.Google:
        return this.googleIdpAuthStrategy;
      case CloudAuthIdpType.GitHub:
        return this.githubIdpCloudAuthStrategy;
      default:
        throw new CloudOauthUnknownAuthorizationRequestException('Unknown cloud auth strategy');
    }
  }

  /**
   * Returns authorization url to open in the native browser to initialize oauth flow
   * @param sessionMetadata
   * @param options
   */
  async getAuthorizationUrl(
    sessionMetadata: SessionMetadata,
    options: {
      strategy: CloudAuthIdpType,
      action?: string,
      callback?: Function,
    },
  ): Promise<string> {
    const authRequest: any = await this.getAuthStrategy(options?.strategy).generateAuthRequest(sessionMetadata);
    authRequest.callback = options?.callback;
    authRequest.action = options?.action;

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

      // todo: handle this?
      throw wrapHttpError(e);
    }
  }

  /**
   * Get some useful not sensitive information about auth request for analytics purpose
   * Will not remove auth request from the pool
   * @param query
   * @private
   */
  private async getAuthRequestInfo(query): Promise<CloudAuthRequestInfo> {
    if (!this.authRequests.has(query?.state)) {
      throw new CloudOauthUnknownAuthorizationRequestException();
    }

    const authRequest = this.authRequests.get(query.state);

    return {
      idpType: authRequest.idpType,
      action: authRequest.action,
    };
  }

  /**
   * Process oauth callback
   * Exchanges code and modify user session
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
      refreshToken: tokens.refresh_token,
      idpType: authRequest.idpType,
    });

    return authRequest.callback;
  }

  private async revokeRefreshToken(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      if (!session?.refreshToken) {
        return;
      }

      const strategy = this.getAuthStrategy(session.idpType);

      const tokenUrl = strategy.generateRevokeTokensUrl(session.refreshToken, 'refresh_token');

      await axios.post(tokenUrl.toString()
        .split('?')[0], tokenUrl.searchParams, {
        headers: {
          accept: 'application/json',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (e) {
      // ignore error
      this.logger.error('Unable to revoke tokens', e);
    }
  }

  /**
   * Handle OAuth callback from Web or by deep link
   * @param query
   * @param from
   */
  async handleCallback(query, from = CloudSsoFeatureStrategy.DeepLink): Promise<CloudAuthResponse> {
    let result: CloudAuthResponse = {
      status: CloudAuthStatus.Succeed,
      message: 'Successfully authenticated',
    };

    let callback;
    let reqInfo: CloudAuthRequestInfo;
    try {
      reqInfo = await this.getAuthRequestInfo(query);
      callback = await this.callback(query);
      this.analytics.sendCloudSignInSucceeded(from, reqInfo?.action);
    } catch (e) {
      this.logger.error(`Error on ${from} cloud oauth callback`, e);

      this.analytics.sendCloudSignInFailed(e, from, reqInfo?.action);

      result = {
        status: CloudAuthStatus.Failed,
        error: wrapHttpError(e).getResponse(),
      };
    }

    try {
      callback?.(result)?.catch((e: Error) => this.logger.error('Async callback failed', e));
    } catch (e) {
      this.logger.error('Callback failed', e);
    }

    return result;
  }

  async renewTokens(sessionMetadata: SessionMetadata, idpType: CloudAuthIdpType, refreshToken: string) {
    try {
      const strategy = this.getAuthStrategy(idpType);

      const tokenUrl = strategy.generateRenewTokensUrl(refreshToken);

      const { data } = await axios.post(tokenUrl.toString()
        .split('?')[0], tokenUrl.searchParams, {
        headers: {
          accept: 'application/json',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
        },
      });

      await this.sessionService.updateSessionData(sessionMetadata.sessionId, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
    } catch (e) {
      throw new CloudApiUnauthorizedException();
    }
  }

  /**
   * Logout user
   * Basically cleans current user session
   * @param sessionMetadata
   */
  async logout(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      this.logger.log('Logout cloud user');

      await this.revokeRefreshToken(sessionMetadata);

      await this.sessionService.deleteSessionData(sessionMetadata.sessionId);

      this.eventEmitter.emit(CloudAuthServerEvent.Logout, sessionMetadata);
    } catch (e) {
      this.logger.error('Unable to logout', e);
      throw wrapHttpError(e);
    }
  }
}
