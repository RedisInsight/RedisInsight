import { Module } from '@nestjs/common';
import { AiQueryController } from 'src/modules/ai/query/ai-query.controller';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { AiQueryService } from 'src/modules/ai/query/ai-query.service';

@Module({
  controllers: [AiQueryController],
  providers: [
    AiQueryProvider,
    AiQueryService,
  ],
})
export class AiQueryModule {}
