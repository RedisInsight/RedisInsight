import { Injectable } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { AiAuthData } from 'src/modules/ai/messages/models/ai.auth-data';
import { AiAuthProvider } from 'src/modules/ai/auth/ai-auth.provider';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { AiUnauthorizedException } from 'src/modules/ai/exceptions';

@Injectable()
export class LocalAiAuthProvider extends AiAuthProvider {
  constructor(
    private readonly cloudUserApiService: CloudUserApiService,
  ) {
    super();
  }

  async getAuthData(sessionMetadata: SessionMetadata): Promise<AiAuthData> {
    const session = await this.cloudUserApiService.getUserSession(sessionMetadata);

    return {
      sessionId: session.apiSessionId,
      csrf: session.csrf,
      accountId: `${session.user.currentAccountId}`,
    };
  }

  async callWithAuthRetry(sessionMetadata: SessionMetadata, fn: () => Promise<any>, retries = 1) {
    try {
      return await fn();
    } catch (e) {
      if (retries > 0 && (e instanceof CloudApiUnauthorizedException || e instanceof AiUnauthorizedException)) {
        await this.cloudUserApiService.invalidateApiSession(sessionMetadata).catch(() => {});
        return this.callWithAuthRetry(sessionMetadata, fn, retries - 1);
      }

      throw e;
    }
  }
}
