import { CloudCapiKeyRepository } from 'src/modules/cloud/capi-key/repository/cloud-capi-key.repository';
import { CloudCapiKey } from 'src/modules/cloud/capi-key/model';
import { wrapHttpError } from 'src/common/utils';
import { SessionMetadata } from 'src/common/models';
import { Injectable, Logger } from '@nestjs/common';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';
import { CloudApiBadRequestException, CloudCapiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { CloudCapiKeyApiProvider } from 'src/modules/cloud/capi-key/cloud-capi-key.api.provider';
import { ServerService } from 'src/modules/server/server.service';
import { plainToClass } from 'class-transformer';
import {
  CloudCapiKeyNotFoundException,
  CloudCapiKeyUnauthorizedException,
} from 'src/modules/cloud/capi-key/exceptions';
import { CloudCapiKeyAnalytics } from 'src/modules/cloud/capi-key/cloud-capi-key.analytics';

@Injectable()
export class CloudCapiKeyService {
  private logger = new Logger('CloudCapiKeyService');

  constructor(
    private readonly api: CloudCapiKeyApiProvider,
    private readonly repository: CloudCapiKeyRepository,
    private readonly cloudUserApiService: CloudUserApiService,
    private readonly cloudSessionService: CloudSessionService,
    private readonly serverService: ServerService,
    private readonly analytics: CloudCapiKeyAnalytics,
  ) {}

  private async generateName(capiKey: Partial<CloudCapiKey>): Promise<string> {
    const serverInfo = await this.serverService.getInfo();

    return `RedisInsight-${serverInfo.id.substring(0, 13)}-${capiKey?.createdAt?.getTime()}`;
  }

  /**
   * Generate CAPI key + secret if needed
   * @param sessionMetadata
   * @param utm
   */
  private async ensureCapiKeys(sessionMetadata: SessionMetadata, utm?: CloudRequestUtm): Promise<CloudCapiKey> {
    try {
      let user = await this.cloudUserApiService.me(sessionMetadata, false, utm);

      let currentAccount = CloudUserApiService.getCurrentAccount(user);

      if (!currentAccount) {
        throw new CloudApiBadRequestException('No active account');
      }

      let capiKey = await this.repository.getByUserAccount(
        sessionMetadata.userId,
        user.id,
        user.currentAccountId,
      );

      if (!capiKey) {
        try {
          const session = await this.cloudSessionService.getSession(sessionMetadata.sessionId);

          // enable capi if needed
          if (!currentAccount?.capiKey) {
            this.logger.log('Trying to enable capi');

            await this.api.enableCapi(session);

            this.logger.log('Successfully enabled capi');

            user = await this.cloudUserApiService.me(sessionMetadata, true, utm);
            currentAccount = CloudUserApiService.getCurrentAccount(user);
          }

          this.logger.log('Creating new capi key');

          capiKey = {
            userId: sessionMetadata.userId,
            cloudUserId: user.id,
            cloudAccountId: user.currentAccountId,
            capiKey: currentAccount?.capiKey,
            createdAt: new Date(),
          } as CloudCapiKey;
          capiKey.name = await this.generateName(capiKey);

          capiKey = await this.repository.create(plainToClass(CloudCapiKey, capiKey));

          const capiSecret = await this.api.createCapiKey(session, user.id, capiKey.name);
          capiKey = await this.repository.update(capiKey.id, { capiSecret: capiSecret.secret_key });

          this.analytics.sendCloudAccountKeyGenerated();
        } catch (e) {
          this.analytics.sendCloudAccountKeyGenerationFailed(e);
          throw e;
        }
      } else if (capiKey.valid === false) {
        return Promise.reject(new CloudCapiKeyUnauthorizedException(
          undefined,
          { resourceId: capiKey.id },
        ));
      }

      await this.cloudUserApiService.updateUser(sessionMetadata, {
        capiKey,
        accounts: user.accounts,
      });

      return capiKey;
    } catch (e) {
      this.logger.error('Unable to generate capi keys', e);
      throw wrapHttpError(e);
    }
  }

  async getCapiCredentials(sessionMetadata: SessionMetadata, utm?: CloudRequestUtm): Promise<CloudCapiKey> {
    const capiKey = await this.ensureCapiKeys(sessionMetadata, utm);

    await this.repository.update(capiKey.id, { lastUsed: new Date() });

    return capiKey;
  }

  async get(id: string): Promise<CloudCapiKey> {
    try {
      this.logger.log('Getting capi key by id');

      const model = await this.repository.get(id);

      if (!model) {
        return Promise.reject(new CloudCapiKeyNotFoundException());
      }

      return model;
    } catch (e) {
      this.logger.log('Unable to get capi key by id', e);

      throw wrapHttpError(e);
    }
  }

  /**
   * Get user's capi key by cloud user id and cloud account id
   * @param sessionMetadata
   * @param cloudUserId
   * @param cloudAccountId
   */
  async getByUserAccount(
    sessionMetadata: SessionMetadata,
    cloudUserId: number,
    cloudAccountId: number,
  ): Promise<CloudCapiKey> {
    try {
      this.logger.log('Getting user\'s capi key by cloud user and cloud account');

      const model = await this.repository.getByUserAccount(sessionMetadata.userId, cloudUserId, cloudAccountId);

      if (!model) {
        throw new CloudCapiKeyNotFoundException();
      }

      return model;
    } catch (e) {
      this.logger.error('Unable to get user\'s capi key by cloud user and cloud account', e);

      throw wrapHttpError(e);
    }
  }

  /**
   * Get user's capi keys list
   * @param sessionMetadata
   */
  async list(sessionMetadata: SessionMetadata): Promise<CloudCapiKey[]> {
    try {
      this.logger.log('Getting list of local capi keys');

      return await this.repository.list(sessionMetadata.userId);
    } catch (e) {
      this.logger.error('Unable to get list of local capi keys', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Removes user's capi key by id
   * @param sessionMetadata
   * @param id
   */
  async delete(sessionMetadata: SessionMetadata, id: string): Promise<void> {
    try {
      this.logger.log('Removing capi key');

      await this.repository.delete(sessionMetadata.userId, id);
    } catch (e) {
      this.logger.error('Unable to remove capi key', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Removes all user's capi keys
   * @param sessionMetadata
   */
  async deleteAll(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      this.logger.log('Removing all capi keys');

      await this.repository.deleteAll(sessionMetadata.userId);
    } catch (e) {
      this.logger.error('Unable to remove all capi keys', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Determines if capi key unauthorized error
   * @param e
   * @param sessionMetadata
   */
  async handleCapiKeyUnauthorizedError(e: Error, sessionMetadata: SessionMetadata): Promise<Error> {
    try {
      if (e instanceof CloudCapiUnauthorizedException) {
        const cloudSession = await this.cloudSessionService.getSession(sessionMetadata.sessionId);

        if (cloudSession.user?.capiKey?.id) {
          // mark key as invalid
          await this.repository.update(cloudSession.user.capiKey.id, { valid: false });
          // remove current key from the user
          await this.cloudUserApiService.updateUser(sessionMetadata, { capiKey: null });

          return new CloudCapiKeyUnauthorizedException(
            undefined, // default message
            { resourceId: cloudSession.user?.capiKey?.id },
          );
        }
      }
    } catch (error) {
      // ignore error
    }

    return e;
  }
}
