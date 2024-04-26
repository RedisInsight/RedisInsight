import { Injectable } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { AiQueryAuthData } from 'src/modules/ai/query/models/ai-query.auth-data';
import { AiQueryAuthProvider } from 'src/modules/ai/query/providers/auth/ai-query-auth.provider';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';

@Injectable()
export class LocalAiQueryAuthProvider extends AiQueryAuthProvider {
  constructor(
    private readonly cloudUserApiService: CloudUserApiService,
  ) {
    super();
  }

  // TODO: do not forget pass utm parameters here
  async getAuthData(sessionMetadata: SessionMetadata): Promise<AiQueryAuthData> {
    const session = await this.cloudUserApiService.getUserSession(sessionMetadata);

    return {
      sessionId: session.apiSessionId,
      csrf: session.csrf,
      accountId: `${session.user.currentAccountId}`,
    };
  }
}
