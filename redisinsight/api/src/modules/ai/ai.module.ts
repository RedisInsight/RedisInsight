import { Module, Type } from '@nestjs/common';
import { AiProvider } from 'src/modules/ai/providers/ai.provider';
import { AiService } from 'src/modules/ai/ai.service';
import { AiAuthProvider } from 'src/modules/ai/providers/auth/ai-auth.provider';
import { LocalAiAuthProvider } from 'src/modules/ai/providers/auth/local.ai-auth.provider';
import { AiMessageRepository } from 'src/modules/ai/repositories/ai.message.repository';
import { LocalAiMessageRepository } from 'src/modules/ai/repositories/local.ai.message.repository';
import { AiContextRepository } from 'src/modules/ai/repositories/ai.context.repository';
import {
  InMemoryAiContextRepository,
} from 'src/modules/ai/repositories/in-memory.ai.context.repository';
import { AiController } from './ai.controller';
import { AiDatabaseController } from './ai-database.controller';
import { AiAgreementRepository } from './repositories/ai.agreement.repository';
import { LocalAiAgreementRepository } from './repositories/local.ai.agreement.repository';

@Module({})
export class AiModule {
  static register(
    aiAuthProvider: Type<AiAuthProvider> = LocalAiAuthProvider,
    aiMessageRepository: Type<AiMessageRepository> = LocalAiMessageRepository,
    aiContextRepository: Type<AiContextRepository> = InMemoryAiContextRepository,
    aiAgreementRepository: Type<AiAgreementRepository> = LocalAiAgreementRepository,
  ) {
    return {
      module: AiModule,
      controllers: [AiController, AiDatabaseController],
      providers: [
        AiProvider,
        AiService,
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
      ],
    };
  }
}
