import { Module, Type } from '@nestjs/common';
import { LocalAiRdiMessageRepository } from 'src/modules/ai/rdi/repositories/local.ai-rdi.message.repository';
import { InMemoryAiRdiContextRepository } from 'src/modules/ai/rdi/repositories/in-memory.ai-rdi.context.repository';
import { AiRdiContextRepository } from 'src/modules/ai/rdi/repositories/ai-rdi.context.repository';
import { AiRdiMessageRepository } from 'src/modules/ai/rdi/repositories/ai-rdi.message.repository';
import { AiRdiController } from 'src/modules/ai/rdi/ai-rdi.controller';
import { AiRdiProvider } from 'src/modules/ai/rdi/providers/ai-rdi.provider';
import { AiRdiService } from 'src/modules/ai/rdi/ai-rdi.service';

@Module({})
export class AiRdiModule {
  static register(
    aiRdiMessageRepository: Type<AiRdiMessageRepository> = LocalAiRdiMessageRepository,
    aiRdiContextRepository: Type<AiRdiContextRepository> = InMemoryAiRdiContextRepository,
  ) {
    return {
      module: AiRdiModule,
      controllers: [AiRdiController],
      providers: [
        AiRdiProvider,
        AiRdiService,
        {
          provide: AiRdiMessageRepository,
          useClass: aiRdiMessageRepository,
        },
        {
          provide: AiRdiContextRepository,
          useClass: aiRdiContextRepository,
        },
      ],
    };
  }
}
