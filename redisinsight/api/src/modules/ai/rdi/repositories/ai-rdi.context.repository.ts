import { SessionMetadata } from 'src/common/models';

export abstract class AiRdiContextRepository {
  /**
   * Should return saved db context if exists in particular chat
   * @param sessionMetadata
   * @param targetId
   * @param accountId
   */
  abstract getFullContext(
    sessionMetadata: SessionMetadata,
    targetId: string,
    accountId?: string,
  ): Promise<object>;

  /**
   * Should save db context for particular chat
   * @param sessionMetadata
   * @param targetId
   * @param accountId
   * @param context
   */
  abstract setFullContext(
    sessionMetadata: SessionMetadata,
    targetId: string,
    context: object,
    accountId?: string,
  ): Promise<object>;

  /**
   * Reset contexts for particular chat
   * @param sessionMetadata
   * @param targetId
   * @param accountId
   */
  abstract reset(
    sessionMetadata: SessionMetadata,
    targetId: string,
    accountId?: string,
  ): Promise<void>;
}
