import { Module, Type } from '@nestjs/common';
import { AiMessageProvider } from 'src/modules/ai/messages/providers/ai.message.provider';
import { AiAuthProvider } from 'src/modules/ai/auth/ai-auth.provider';
import { LocalAiAuthProvider } from 'src/modules/ai/auth/local.ai-auth.provider';
import { AiMessageRepository } from 'src/modules/ai/messages/repositories/ai.message.repository';
import { AiContextRepository } from 'src/modules/ai/messages/repositories/ai.context.repository';

import { AiAgreementRepository } from './agreements/repositories/ai.agreement.repository';
import { LocalAiAgreementRepository } from './agreements/repositories/local.ai.agreement.repository';
import { AiMessagesController } from './messages/ai-messages.controller';
import { AiDatabaseMessagesController } from './messages/ai-database-messages.controller';
import { AiAgreementsController } from './agreements/ai-agreements.controller';
import { AiDatabaseAgreementsController } from './agreements/ai-database-agreements.controller';
import { LocalAiMessageRepository } from './messages/repositories/local.ai.message.repository';
import { InMemoryAiContextRepository } from './messages/repositories/in-memory.ai.context.repository';
import { AiMessageService } from './messages/ai.message.service';
import { AiAgreementService } from './agreements/ai.agreement.service';
import { AiDatabaseAgreementService } from './agreements/ai.database.agreement.service';
import { AiDatabaseAgreementRepository } from './agreements/repositories/ai.database.agreement.repository';
import { LocalAiDatabaseAgreementRepository } from './agreements/repositories/local.ai.database.agreement.repository';

@Module({})
export class AiModule {
  static register(
    aiAuthProvider: Type<AiAuthProvider> = LocalAiAuthProvider,
    aiMessageRepository: Type<AiMessageRepository> = LocalAiMessageRepository,
    aiContextRepository: Type<AiContextRepository> = InMemoryAiContextRepository,
    aiAgreementRepository: Type<AiAgreementRepository> = LocalAiAgreementRepository,
    aiDatabaseAgreementRepository: Type<AiDatabaseAgreementRepository> = LocalAiDatabaseAgreementRepository,
  ) {
    return {
      module: AiModule,
      controllers: [
        AiMessagesController,
        AiDatabaseMessagesController,
        AiAgreementsController,
        AiDatabaseAgreementsController,
      ],
      providers: [
        AiMessageProvider,
        AiMessageService,
        AiAgreementService,
        AiDatabaseAgreementService,
        {
          provide: AiAuthProvider,
          useClass: aiAuthProvider,
        },
        {
          provide: AiMessageRepository,
          useClass: aiMessageRepository,
        },
        {
          provide: AiContextRepository,
          useClass: aiContextRepository,
        },
        {
          provide: AiAgreementRepository,
          useClass: aiAgreementRepository,
        },
        {
          provide: AiDatabaseAgreementRepository,
          useClass: aiDatabaseAgreementRepository,
        },
      ],
    };
  }
}
