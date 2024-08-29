import {
  Body,
  ClassSerializerInterceptor,
  Controller, Logger, Param,
  Post, Res, Get, Delete,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { AiService } from 'src/modules/ai/ai.service';
import { SendAiMessageDto } from 'src/modules/ai/dto/send.ai.message.dto';
import { Response } from 'express';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/:id/messages')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiDatabaseController {
  private readonly logger = new Logger('AiController');

  constructor(
    private readonly service: AiService,
  ) {}

  @Post()
  @ApiEndpoint({
    description: 'Generate new message for database',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async streamQuestion(
  @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') databaseId: string,
    @Body() dto: SendAiMessageDto,
    @Res() res: Response,
  ) {
    await this.service.stream(sessionMetadata, databaseId, dto, res);
  }

  @Get()
  @ApiEndpoint({
    description: 'Get history of messages for database',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async getHistory(
  @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') databaseId: string,
  ) {
    return this.service.getHistory(sessionMetadata, databaseId);
  }

  @Delete()
  @ApiEndpoint({
    description: 'Clean history of messages for database',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async clearHistory(
  @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Param('id') databaseId: string,
  ) {
    return this.service.clearHistory(sessionMetadata, databaseId);
  }
}
