import { Module, Type } from '@nestjs/common';
import { LocalAiDataGeneratorMessageRepository } from 'src/modules/ai/data-generator/repositories/local.ai-data-generator.message.repository';
import { AiDataGeneratorMessageRepository } from 'src/modules/ai/data-generator/repositories/ai-data-generator.message.repository';
import { AiDataGeneratorController } from 'src/modules/ai/data-generator/ai-data-generator.controller';
import { AiDataGeneratorProvider } from 'src/modules/ai/data-generator/providers/ai-data-generator.provider';
import { AiDataGeneratorService } from 'src/modules/ai/data-generator/ai-data-generator.service';

@Module({})
export class AiDataGeneratorModule {
  static register(
    aiDataGeneratorMessageRepository: Type<AiDataGeneratorMessageRepository> = LocalAiDataGeneratorMessageRepository,
  ) {
    return {
      module: AiDataGeneratorModule,
      controllers: [AiDataGeneratorController],
      providers: [
        AiDataGeneratorProvider,
        AiDataGeneratorService,
        {
          provide: AiDataGeneratorMessageRepository,
          useClass: aiDataGeneratorMessageRepository,
        },
      ],
    };
  }
}
