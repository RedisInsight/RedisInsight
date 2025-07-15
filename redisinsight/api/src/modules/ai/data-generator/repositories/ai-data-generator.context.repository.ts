import { SessionMetadata } from 'src/common/models';

export abstract class AiDataGeneratorContextRepository {
  /**
   * Should return saved db context if exists in particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   */
  abstract getFullDbContext(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId?: string,
  ): Promise<object>;

  /**
   * Should save db context for particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   * @param context
   */
  abstract setFullDbContext(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    context: object,
    accountId?: string,
  ): Promise<object>;

  /**
   * Should return saved index context if exists in particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   * @param index
   */
  abstract getIndexContext(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    index: string,
    accountId?: string,
  ): Promise<object>;

  /**
   * Should save index context for particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   * @param index
   * @param context
   */
  abstract setIndexContext(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    index: string,
    context: object,
    accountId?: string,
  ): Promise<object>;

  /**
   * Reset all index and db contexts for particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   */
  abstract reset(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId?: string,
  ): Promise<void>;
} 