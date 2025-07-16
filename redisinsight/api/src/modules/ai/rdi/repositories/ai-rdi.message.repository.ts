import { AiRdiMessage } from 'src/modules/ai/rdi/models';

export abstract class AiRdiMessageRepository {
  abstract list(targetId: string, accountId?: string): Promise<AiRdiMessage[]>;
  abstract createMany(messages: AiRdiMessage[]): Promise<void>;
  abstract clearHistory(targetId: string, accountId?: string): Promise<void>;
}
