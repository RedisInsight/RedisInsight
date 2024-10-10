import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post, Res, Get, Delete,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { AiMessageDto } from './dto/send.ai.message.dto';
import { AiMessageService } from './ai.message.service';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/messages')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiMessagesController {
  constructor(
    private readonly service: AiMessageService,
  ) {}

  @Post()
  @ApiEndpoint({
    description: 'Generate new message',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async postMessage(
  @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Res() res: Response,
    @Body() dto: AiMessageDto,
  ) {
    await this.service.streamGeneralMessage(sessionMetadata, dto, res);
  }

  @Get()
  @ApiEndpoint({
    description: 'Get history of messages',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async getHistory(
  @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ) {
    return this.service.getHistory(sessionMetadata, null);
  }

  @Delete()
  @ApiEndpoint({
    description: 'Clean history',
    statusCode: 200,
    responses: [{ type: String }],
  })
  async clearHistory(
  @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ) {
    return this.service.clearHistory(sessionMetadata, null);
  }
}
