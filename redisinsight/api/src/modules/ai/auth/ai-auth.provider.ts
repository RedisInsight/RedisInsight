import { SessionMetadata } from 'src/common/models';
import { AiAuthData } from 'src/modules/ai/messages/models/ai.auth-data';

export abstract class AiAuthProvider {
  abstract getAuthData(sessionMetadata: SessionMetadata): Promise<AiAuthData>;
  abstract callWithAuthRetry(sessionId: SessionMetadata, fn: () => Promise<any>, retries?: number): Promise<any>;
}
