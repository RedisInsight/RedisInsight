import { Module, Type } from '@nestjs/common';
import { LocalAiExtendedMessageRepository } from 'src/modules/ai/extended/repositories/local.ai-extended.message.repository';
import { InMemoryAiExtendedContextRepository } from 'src/modules/ai/extended/repositories/in-memory.ai-extended.context.repository';
import { AiExtendedContextRepository } from 'src/modules/ai/extended/repositories/ai-extended.context.repository';
import { AiExtendedMessageRepository } from 'src/modules/ai/extended/repositories/ai-extended.message.repository';
import { AiExtendedController } from 'src/modules/ai/extended/ai-extended.controller';
import { AiExtendedProvider } from 'src/modules/ai/extended/providers/ai-extended.provider';
import { AiExtendedService } from 'src/modules/ai/extended/ai-extended.service';

@Module({})
export class AiExtendedModule {
  static register(
    aiExtendedMessageRepository: Type<AiExtendedMessageRepository> = LocalAiExtendedMessageRepository,
    aiExtendedContextRepository: Type<AiExtendedContextRepository> = InMemoryAiExtendedContextRepository,
  ) {
    return {
      module: AiExtendedModule,
      controllers: [AiExtendedController],
      providers: [
        AiExtendedProvider,
        AiExtendedService,
        {
          provide: AiExtendedMessageRepository,
          useClass: aiExtendedMessageRepository,
        },
        {
          provide: AiExtendedContextRepository,
          useClass: aiExtendedContextRepository,
        },
      ],
    };
  }
}
