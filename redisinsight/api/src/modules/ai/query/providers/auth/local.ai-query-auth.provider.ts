import { Injectable } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { AiQueryAuthData } from 'src/modules/ai/query/models/ai-query.auth-data';
import { AiQueryAuthProvider } from 'src/modules/ai/query/providers/auth/ai-query-auth.provider';
import { CloudOauthApiService } from 'src/modules/cloud/oauth/cloud-oauth.api.service';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { AiQueryUnauthorizedException } from 'src/modules/ai/query/exceptions';

@Injectable()
export class LocalAiQueryAuthProvider extends AiQueryAuthProvider {
  constructor(
    private readonly cloudUserApiService: CloudOauthApiService,
  ) {
    super();
  }

  async getAuthData(sessionMetadata: SessionMetadata): Promise<AiQueryAuthData> {
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
      if (retries > 0 && (e instanceof CloudApiUnauthorizedException || e instanceof AiQueryUnauthorizedException)) {
        await this.cloudUserApiService.invalidateApiSession(sessionMetadata).catch(() => {});
        return this.callWithAuthRetry(sessionMetadata, fn, retries - 1);
      }

      throw e;
    }
  }
}
