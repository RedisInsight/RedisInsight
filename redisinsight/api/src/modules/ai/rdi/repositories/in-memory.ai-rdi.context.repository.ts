import { Injectable } from '@nestjs/common';
import { get, set, unset } from 'lodash';
import { SessionMetadata } from 'src/common/models';
import { AiRdiContextRepository } from 'src/modules/ai/rdi/repositories/ai-rdi.context.repository';

@Injectable()
export class InMemoryAiRdiContextRepository extends AiRdiContextRepository {
  private chats: Record<string, { index: Record<string, object>; db: object }> =
    {};

  static getChatId(targetId: string, accountId?: string) {
    return `${targetId}_${accountId}`;
  }

  /**
   * @inheritdoc
   */
  async getFullContext(
    _sessionMetadata: SessionMetadata,
    targetId: string,
    accountId?: string,
  ): Promise<object> {
    const chatId = InMemoryAiRdiContextRepository.getChatId(
      targetId,
      accountId,
    );

    return get(this.chats, [chatId, 'db'], null);
  }

  /**
   * @inheritdoc
   */
  async setFullContext(
    _sessionMetadata: SessionMetadata,
    targetId: string,
    context: object,
    accountId?: string,
  ): Promise<object> {
    const chatId = InMemoryAiRdiContextRepository.getChatId(
      targetId,
      accountId,
    );

    set(this.chats, [chatId, 'db'], context);

    return context;
  }

  /**
   * @inheritdoc
   */
  async reset(
    _sessionMetadata: SessionMetadata,
    targetId: string,
    accountId?: string,
  ): Promise<void> {
    const chatId = InMemoryAiRdiContextRepository.getChatId(
      targetId,
      accountId,
    );

    unset(this.chats, [chatId]);
  }
}
