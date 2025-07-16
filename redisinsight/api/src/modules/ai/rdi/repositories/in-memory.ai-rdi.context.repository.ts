import { Injectable } from '@nestjs/common';
import { get, set, unset } from 'lodash';
import { SessionMetadata } from 'src/common/models';
import { AiRdiContextRepository } from 'src/modules/ai/rdi/repositories/ai-rdi.context.repository';

@Injectable()
export class InMemoryAiRdiContextRepository extends AiRdiContextRepository {
  private chats: Record<string, { index: Record<string, object>; db: object }> =
    {};

  static getChatId(databaseId: string, accountId?: string) {
    return `${databaseId}_${accountId}`;
  }

  /**
   * @inheritdoc
   */
  async getFullDbContext(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId?: string,
  ): Promise<object> {
    const chatId = InMemoryAiRdiContextRepository.getChatId(
      databaseId,
      accountId,
    );

    return get(this.chats, [chatId, 'db'], null);
  }

  /**
   * @inheritdoc
   */
  async setFullDbContext(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
    context: object,
    accountId?: string,
  ): Promise<object> {
    const chatId = InMemoryAiRdiContextRepository.getChatId(
      databaseId,
      accountId,
    );

    set(this.chats, [chatId, 'db'], context);

    return context;
  }

  /**
   * @inheritdoc
   */
  async getIndexContext(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
    index: string,
    accountId?: string,
  ): Promise<object> {
    const chatId = InMemoryAiRdiContextRepository.getChatId(
      databaseId,
      accountId,
    );

    return get(this.chats, [chatId, 'index', index], null);
  }

  /**
   * @inheritdoc
   */
  async setIndexContext(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
    index: string,
    context: object,
    accountId?: string,
  ): Promise<object> {
    const chatId = InMemoryAiRdiContextRepository.getChatId(
      databaseId,
      accountId,
    );

    set(this.chats, [chatId, 'index', index], context);

    return context;
  }

  /**
   * @inheritdoc
   */
  async reset(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId?: string,
  ): Promise<void> {
    const chatId = InMemoryAiRdiContextRepository.getChatId(
      databaseId,
      accountId,
    );

    unset(this.chats, [chatId]);
  }
}
