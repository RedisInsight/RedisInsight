import { find } from 'lodash';
import { decode } from 'jsonwebtoken';
import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { CloudUser, CloudUserAccount } from 'src/modules/cloud/user/models';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { wrapHttpError } from 'src/common/utils';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudUserApiProvider } from 'src/modules/cloud/user/providers/cloud-user.api.provider';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import config from 'src/utils/config';

const cloudConfig = config.get('cloud');

@Injectable()
export class CloudUserApiService {
  private logger = new Logger('CloudUserApiService');

  constructor(
    private readonly cloudAuthService: CloudAuthService,
    private readonly repository: CloudUserRepository,
    private readonly sessionService: CloudSessionService,
    private readonly api: CloudUserApiProvider,
  ) {}

  /**
   * Find current account in accounts list by currentAccountId
   * @param user
   */
  static getCurrentAccount(user: CloudUser): CloudUserAccount {
    return find(user?.accounts, { id: user?.currentAccountId });
  }

  /**
   * Fetch csrf token if needed
   * @param sessionMetadata
   * @private
   */
  private async ensureCsrf(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      if (!session?.csrf) {
        this.logger.log('Trying to get csrf token');
        const csrf = await this.api.getCsrfToken(session);

        if (!csrf) {
          throw new CloudApiUnauthorizedException();
        }

        await this.sessionService.updateSessionData(sessionMetadata.sessionId, { csrf });
      }
    } catch (e) {
      this.logger.error('Unable to get csrf token', e);
      throw wrapHttpError(e);
    }
  }

  private async ensureAccessToken(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      if (!session?.accessToken) {
        throw new CloudApiUnauthorizedException();
      }

      const decodedJwt = decode(session.accessToken);

      const expiresIn = decodedJwt.exp * 1_000 - Date.now();

      if (expiresIn < cloudConfig.renewTokensBeforeExpire) {
        // need to renew
        await this.cloudAuthService.renewTokens(sessionMetadata, session.idpType, session.refreshToken);
      }
    } catch (e) {
      throw new CloudApiUnauthorizedException();
    }
  }

  /**
   * Login user to api using accessToken from oauth flow
   * @param sessionMetadata
   * @param utm
   * @private
   */
  private async ensureLogin(sessionMetadata: SessionMetadata, utm?: CloudRequestUtm): Promise<void> {
    try {
      await this.ensureAccessToken(sessionMetadata);

      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      if (!session?.apiSessionId) {
        this.logger.log('Trying to login user');
        const apiSessionId = await this.api.getApiSessionId(session, utm);

        if (!apiSessionId) {
          throw new CloudApiUnauthorizedException();
        }

        await this.sessionService.updateSessionData(sessionMetadata.sessionId, { apiSessionId });
      }

      await this.ensureCsrf(sessionMetadata);
    } catch (e) {
      this.logger.error('Unable to login user', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Sync cloud user profile when needed
   * Always sync with force=true
   * @param sessionMetadata
   * @param force
   * @param utm
   * @private
   */
  private async ensureCloudUser(sessionMetadata: SessionMetadata, force = false, utm?: CloudRequestUtm) {
    try {
      await this.ensureLogin(sessionMetadata, utm);

      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      const existingUser = await this.repository.get(sessionMetadata.sessionId);

      if (existingUser?.id && !force) {
        return;
      }

      this.logger.log('Trying to sync user profile');

      const userData = await this.api.getCurrentUser(session);

      const user: CloudUser = {
        id: +userData?.id,
        name: userData?.name,
        currentAccountId: +userData?.current_account_id,
      };

      const accounts = await this.api.getAccounts(session);

      // todo: remember existing CApi key?
      user.accounts = accounts?.map?.((account) => ({
        id: account.id,
        name: account.name,
        capiKey: account?.api_access_key,
      }));

      await this.repository.update(sessionMetadata.sessionId, user);
      this.logger.log('Successfully synchronized user profile');
    } catch (e) {
      this.logger.error('Unable to sync user profile', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Get cloud user profile
   * @param sessionMetadata
   * @param forceSync
   * @param utm
   */
  async me(sessionMetadata: SessionMetadata, forceSync = false, utm?: CloudRequestUtm): Promise<CloudUser> {
    try {
      await this.ensureCloudUser(sessionMetadata, forceSync, utm);

      return await this.repository.get(sessionMetadata.sessionId);
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  /**
   * Select current account to work with
   * @param sessionMetadata
   * @param accountId
   */
  async setCurrentAccount(sessionMetadata: SessionMetadata, accountId: string | number): Promise<CloudUser> {
    try {
      this.logger.log('Switching user account');

      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      await this.api.setCurrentAccount(session, +accountId);

      return this.me(sessionMetadata, true);
    } catch (e) {
      this.logger.error('Unable to switch current account', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Update user data
   * @param sessionMetadata
   * @param data
   */
  async updateUser(sessionMetadata: SessionMetadata, data: Partial<CloudUser>): Promise<CloudUser> {
    return this.repository.update(sessionMetadata.sessionId, data);
  }
}
