import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { wrapAiError } from 'src/modules/ai/exceptions';
import { AiAuthProvider } from 'src/modules/ai/auth/ai-auth.provider';
import { plainToClass } from 'class-transformer';
import { AiAgreement } from './models/ai.agreement';
import { AiAgreementRepository } from './repositories/ai.agreement.repository';
import { UpdateAiAgreementDto } from './dto/update.ai.agreement.dto';

@Injectable()
export class AiAgreementService {
  private readonly logger = new Logger('AiService');

  constructor(
    private readonly aiAuthProvider: AiAuthProvider,
    private readonly aiAgreementRepository: AiAgreementRepository,
  ) {}

  async getAiAgreement(sessionMetadata: SessionMetadata): Promise<AiAgreement> {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      try {
        this.logger.log('Getting Ai Agreements data');
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        return await this.aiAgreementRepository.get(sessionMetadata, auth.accountId);
      } catch (e) {
        throw wrapAiError(e, 'Unable to get Ai Agreement');
      }
    });
  }

  async saveAiAgreement(sessionMetadata: SessionMetadata, dto: UpdateAiAgreementDto): Promise<AiAgreement> {
    return this.aiAuthProvider.callWithAuthRetry(sessionMetadata, async () => {
      try {
        this.logger.log('Saving Ai Agreements data');
        const auth = await this.aiAuthProvider.getAuthData(sessionMetadata);
        return await this.aiAgreementRepository.save(
          sessionMetadata,
          plainToClass(AiAgreement, { ...dto, accountId: auth.accountId }),
        );
      } catch (e) {
        throw wrapAiError(e, 'Unable to create Ai Agreement');
      }
    });
  }
}
