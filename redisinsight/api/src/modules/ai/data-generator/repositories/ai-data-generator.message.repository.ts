import { AiDataGeneratorMessage } from 'src/modules/ai/data-generator/models';

export abstract class AiDataGeneratorMessageRepository {
  abstract list(
    databaseId: string,
    accountId?: string,
  ): Promise<AiDataGeneratorMessage[]>;
  abstract createMany(messages: AiDataGeneratorMessage[]): Promise<void>;
  abstract clearHistory(databaseId: string, accountId?: string): Promise<void>;
} 