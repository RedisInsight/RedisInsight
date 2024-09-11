import { AiAgreement } from '../models/ai.agreement';

export abstract class AiAgreementRepository {
  /**
   * Should return ai agreemet of a given DB and account
   * @param databaseId
   * @param accountId
   */
  abstract get(
    databaseId: string,
    accountId: string,
  ): Promise<AiAgreement>;

  /**
   * Should create an Ai agreement for a given DB and Account
   * @param databaseId
   * @param accountId
   */
  abstract create(
    databaseId: string,
    accountId: string,
  ): Promise<AiAgreement>;
}
