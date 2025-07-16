import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { Response } from 'express';
import { AiRdiService } from 'src/modules/ai/rdi/ai-rdi.service';
import { SendAiRdiMessageDto } from 'src/modules/ai/rdi/dto/send.ai-rdi.message.dto';

// Define constant for the duplicate string
const GENERATE_NEW_QUERY_DESCRIPTION = 'Generate new query';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/rdi/:id/messages')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiRdiController {
  private readonly logger = new Logger('AiRdiController');

  constructor(private readonly service: AiRdiService) {}

  @Post()
  @ApiEndpoint({
    description: GENERATE_NEW_QUERY_DESCRIPTION,
    statusCode: 200,
    responses: [{ type: String }],
  })
  async streamQuestion(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') targetId: string,
    @Body() dto: SendAiRdiMessageDto,
    @Res() res: Response,
  ) {
    await this.service.stream(sessionMetadata, targetId, dto, res);
  }

  @Get()
  @ApiEndpoint({
    description: GENERATE_NEW_QUERY_DESCRIPTION,
    statusCode: 200,
    responses: [{ type: String }],
  })
  async getHistory(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') targetId: string,
  ) {
    this.logger.debug('getHistory');
    return this.service.getHistory(sessionMetadata, targetId);
  }

  @Delete()
  @ApiEndpoint({
    description: GENERATE_NEW_QUERY_DESCRIPTION,
    statusCode: 200,
    responses: [{ type: String }],
  })
  async clearHistory(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') targetId: string,
  ) {
    return this.service.clearHistory(sessionMetadata, targetId);
  }
}
