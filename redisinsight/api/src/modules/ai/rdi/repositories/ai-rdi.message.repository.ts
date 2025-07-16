import { AiRdiMessage } from 'src/modules/ai/rdi/models';

export abstract class AiRdiMessageRepository {
  abstract list(
    databaseId: string,
    accountId?: string,
  ): Promise<AiRdiMessage[]>;
  abstract createMany(messages: AiRdiMessage[]): Promise<void>;
  abstract clearHistory(databaseId: string, accountId?: string): Promise<void>;
}
