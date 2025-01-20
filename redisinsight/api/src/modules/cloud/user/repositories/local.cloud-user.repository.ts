import { Injectable } from '@nestjs/common';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { SessionMetadata } from 'src/common/models';
import { CloudUser } from 'src/modules/cloud/user/cloud-user.model';

@Injectable()
export class LocalCloudUserRepository extends CloudUserRepository {
  /**
   * Get user model from current session
   */
  async get(sessionMetadata: SessionMetadata): Promise<CloudUser> {
    console.log('session meta', sessionMetadata);
    return {
      id: sessionMetadata.userId,
      name: null,
      currentAccountId: sessionMetadata.data?.accountId,
      currentAccountName: null,
      data: sessionMetadata.data,
    };
  }
}
