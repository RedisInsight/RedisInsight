import {
  Body,
  ClassSerializerInterceptor,
  Controller, Logger,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { AiQueryService } from 'src/modules/ai/query/ai-query.service';
import { SendAiQueryMessageDto } from 'src/modules/ai/query/dto/send.ai-query.message.dto';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/expert/queries')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiQueryController {
  private readonly logger = new Logger('AiQueryController');

  constructor(
    private readonly service: AiQueryService,
  ) {}

  @Post('/')
  @ApiEndpoint({
    description: 'Generate new query',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async generateQuery(
  @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Body() dto: SendAiQueryMessageDto,
  ) {
    try {
      return await this.service.generateQuery(sessionMetadata, dto);
    } catch (e) {
      this.logger.error(e.message, e);
      return {
        error: '*It seems you’re trying to initiate a search query, but I need a bit more context to assist you accurately. Could you please provide more details or clarify what specific information or action you are looking for?*',
      };
    }
  }
}
