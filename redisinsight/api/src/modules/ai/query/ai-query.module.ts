import { Module } from '@nestjs/common';
import { AiQueryController } from 'src/modules/ai/query/ai-query.controller';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { AiQueryService } from 'src/modules/ai/query/ai-query.service';
import { AiContextProvider } from 'src/modules/ai/query/providers/ai-context.provider';

@Module({
  controllers: [AiQueryController],
  providers: [
    AiContextProvider,
    AiQueryProvider,
    AiQueryService,
  ],
})
export class AiQueryModule {}
