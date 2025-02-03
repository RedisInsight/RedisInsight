import { SessionMetadata } from 'src/common/models';
import { AiAgreement } from '../models/ai.agreement';

export abstract class AiAgreementRepository {
  /**
   * Should return ai agreemet of a given account
   * @param sessionMetadata
   * @param accountId
   */
  abstract get(
    sessionMetadata: SessionMetadata,
    accountId: string,
  ): Promise<AiAgreement>;

  /**
   * Should create or update Ai agreement for a given Account
   * @param sessionMetadata
   * @param agreement
   */
  abstract save(
    sessionMetadata: SessionMetadata,
    agreement: AiAgreement
  ): Promise<AiAgreement>;
}
