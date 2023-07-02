import { find } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { CloudUser, CloudUserAccount } from 'src/modules/cloud/user/models';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import config from 'src/utils/config';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudSubscriptionType } from 'src/modules/cloud/autodiscovery/models';
import { wrapHttpError } from 'src/common/utils';
import { CloudSubscriptionService } from 'src/modules/cloud/subscription/cloud-subscription.service';
import { CloudApiBadRequestException, CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';

const cloudConfig = config.get('cloud');

@Injectable()
export class CloudUserService {
  private logger = new Logger('CloudUserService');

  constructor(
    private readonly repository: CloudUserRepository,
    private readonly sessionService: CloudSessionService,
    private readonly api: CloudUserApiService,
    private readonly cloudSubscriptionService: CloudSubscriptionService,
  ) {}

  /**
   * Fetch csrf token if needed
   * @param sessionMetadata
   * @private
   */
  private async ensureCsrf(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      if (!session?.csrf) {
        this.logger.log('Trying to login user');
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

  /**
   * Login user to api using accessToken from oauth flow
   * @param sessionMetadata
   * @private
   */
  private async ensureLogin(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      if (!session?.apiSessionId) {
        this.logger.log('Trying to login user');
        const apiSessionId = await this.api.getApiSessionId(session);

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
   * Sync cloud user profile
   * @param sessionMetadata
   * @private
   */
  private async syncCloudUser(sessionMetadata: SessionMetadata) {
    try {
      await this.ensureLogin(sessionMetadata);

      this.logger.log('Syncing user profile');

      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

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
        apiAccessKey: account?.api_access_key,
      }));

      const currentAccount = CloudUserService.getCurrentAccount(user);

      if (currentAccount?.apiAccessKey) {
        user.currentCApiAccessKey = currentAccount.apiAccessKey;
      }

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
   */
  async me(sessionMetadata: SessionMetadata): Promise<CloudUser> {
    try {
      await this.syncCloudUser(sessionMetadata);

      return this.repository.get(sessionMetadata.sessionId);
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

      return this.me(sessionMetadata);
    } catch (e) {
      this.logger.error('Unable to switch current account', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Generate CApi key
   * @param sessionMetadata
   */
  async generateCKeys(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      this.logger.log('Generating CApi keys');

      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      const user = await this.repository.get(sessionMetadata.sessionId);

      const currentAccount = CloudUserService.getCurrentAccount(user);

      if (!currentAccount) {
        throw new CloudApiBadRequestException('No active account');
      }

      if (!user?.currentCApiAccessKey) {
        // todo: enable API
        throw new Error('TBD: Enable API');
      }

      const existingKeys = await this.api.getCApiKeys(session);

      if (existingKeys?.length) {
        const existingKey = find(existingKeys, { name: cloudConfig.cloudApiKeyName });

        if (existingKey) {
          this.logger.log('Removing existing CApi key');
          await this.api.deleteCApiKeys(session, existingKey.id);
        }
      }

      this.logger.log('Creating new CApi key');
      const apiKey = await this.api.createCApiKey(session, user.id);
      currentAccount.apiKey = apiKey.secret_key;

      await this.repository.update(sessionMetadata.sessionId, {
        currentCApiKey: apiKey.secret_key,
        accounts: user.accounts,
      });
    } catch (e) {
      this.logger.error('Unable to generate CApi keys', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Creating free database along with subscription if needed
   * @param sessionMetadata
   */
  async createFreeDatabase(sessionMetadata: SessionMetadata) {
    try {
      this.logger.log('Creating free database');

      const session = await this.sessionService.getSession(sessionMetadata.sessionId);

      const user = await this.repository.get(sessionMetadata.sessionId);

      const fixedSubscriptions = await this.cloudSubscriptionService.getSubscriptionsByType({
        apiKey: user.currentCApiKey,
        apiSecret: user.currentCApiAccessKey,
      }, CloudSubscriptionType.Fixed);

      console.log('___ fixedSubscriptions', fixedSubscriptions);
    } catch (e) {
      this.logger.error('Unable to create free database', e);
      throw wrapHttpError(e);
    }
  }

  static getCurrentAccount(user: CloudUser): CloudUserAccount {
    return find(user?.accounts, { id: user?.currentAccountId });
  }
}
