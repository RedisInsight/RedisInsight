import { SessionMetadata } from 'src/common/models';
import { AiDatabaseAgreement } from '../models/ai.database.agreement';

export abstract class AiDatabaseAgreementRepository {
  /**
   * Should return ai database agreemet for a given databaseId and account
   * @param sessionMetadata
   * @params databaseId
   * @param accountId
   */
  abstract get(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
  ): Promise<AiDatabaseAgreement>;

  /**
   * Should create or update ai database agreement for a given databaseId and account
   * @param sessionMetadata
   * @param agreement
   */
  abstract save(
    sessionMetadata: SessionMetadata,
    agreement: AiDatabaseAgreement,
  ): Promise<AiDatabaseAgreement>;
}
