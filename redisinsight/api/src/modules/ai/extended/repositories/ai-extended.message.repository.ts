import { AiExtendedMessage } from 'src/modules/ai/extended/models';

export abstract class AiExtendedMessageRepository {
  abstract list(
    databaseId: string,
    accountId?: string,
  ): Promise<AiExtendedMessage[]>;
  abstract createMany(messages: AiExtendedMessage[]): Promise<void>;
  abstract clearHistory(databaseId: string, accountId?: string): Promise<void>;
}
