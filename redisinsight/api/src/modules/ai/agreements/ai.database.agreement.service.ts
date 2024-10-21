import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { wrapAiError } from 'src/modules/ai/exceptions';
import { AiAuthProvider } from 'src/modules/ai/auth/ai-auth.provider';
import { plainToClass } from 'class-transformer';
import { AiDatabaseAgreementRepository } from './repositories/ai.database.agreement.repository';
import { UpdateAiDatabaseAgreementDto } from './dto/update.ai.database.agreement.dto';
import { AiDatabaseAgreement } from './models/ai.database.agreement';

@Injectable()
export class AiDatabaseAgreementService {
  private readonly logger = new Logger('AiService');

  constructor(
    private readonly aiAuthProvider: AiAuthProvider,
    private readonly aiDatabaseAgreementRepository: AiDatabaseAgreementRepository,
  ) {}

  async getAiDatabaseAgreement(sessionMetadata: SessionMetadata, databaseId: string): Promise<AiDatabaseAgreement> {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      this.logger.log('Getting Ai Database Agreements data');
      try {
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        return await this.aiDatabaseAgreementRepository.get(sessionMetadata, databaseId, auth.accountId);
      } catch (e) {
        throw wrapAiError(e, 'Unable to get Ai Agreement');
      }
    });
  }

  async saveAiDatabaseAgreement(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    dto: UpdateAiDatabaseAgreementDto,
  ): Promise<AiDatabaseAgreement> {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      this.logger.log('Saving Ai Database Agreements data');
      try {
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        return await this.aiDatabaseAgreementRepository.save(
          sessionMetadata,
          plainToClass(AiDatabaseAgreement, { ...dto, databaseId, accountId: auth.accountId }),
        );
      } catch (e) {
        throw wrapAiError(e, 'Unable to create Ai Agreement');
      }
    });
  }
}
