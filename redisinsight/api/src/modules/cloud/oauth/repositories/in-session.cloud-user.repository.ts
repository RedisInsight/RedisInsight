import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { OauthUserRepository } from 'src/modules/cloud/oauth/repositories/oauth-user.repository';
import { CloudOauthUser } from 'src/modules/cloud/oauth/models';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { TransformGroup } from 'src/common/constants';

@Injectable()
export class InSessionCloudUserRepository extends OauthUserRepository {
  constructor(
    private readonly sessionService: CloudSessionService,
  ) {
    super();
  }

  /**
   * Get user model from current session
   * @param sessionId
   */
  async get(sessionId: string): Promise<CloudOauthUser> {
    const session = await this.sessionService.getSession(sessionId);

    return plainToClass(CloudOauthUser, session?.user, { groups: [TransformGroup.Secure] }) || null;
  }

  /**
   * Update user data in session
   * @param sessionId
   * @param data
   */
  async update(sessionId: string, data: Partial<CloudOauthUser>): Promise<CloudOauthUser> {
    const user = await this.get(sessionId);
    await this.sessionService.updateSessionData(sessionId, {
      user: plainToClass(CloudOauthUser, {
        ...classToPlain(user, { groups: [TransformGroup.Secure] }),
        ...classToPlain(data, { groups: [TransformGroup.Secure] }),
      }, { groups: [TransformGroup.Secure] }),
    });

    return this.get(sessionId);
  }
}
