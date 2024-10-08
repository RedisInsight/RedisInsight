import { Nullable } from 'src/common/constants';
import { SessionMetadata } from 'src/common/models';
import { AiMessage } from 'src/modules/ai/messages/models';

export abstract class AiMessageRepository {
  abstract list(
    sessionMetadata: SessionMetadata,
    databaseId: Nullable<string>,
    accountId: string
  ): Promise<AiMessage[]>;

  abstract createMany(
    sessionMetadata: SessionMetadata,
    messages: AiMessage[]
  ): Promise<void>;

  abstract clearHistory(
    sessionMetadata: SessionMetadata,
    databaseId: Nullable<string>,
    accountId: string
  ): Promise<void>;
}
