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
import { AiService } from './ai.service';
import { AiMessageDto } from './dto/send.ai.message.dto';
import { UpdateAiAgreementsDto } from './dto/update.ai.agreements.dto';
import { AiAgreement, AiAgreementResponse } from './models/ai.agreement';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/messages')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiController {
  constructor(
    private readonly service: AiService,
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

  @Get('/agreements')
  @ApiEndpoint({
    description: 'Get list of  ai agreements',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'General Ai agreement',
        type: AiAgreementResponse,
      },
    ],
  })
  async listAiAgreements(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<AiAgreement[]> {
    return this.service.listAiAgreements(sessionMetadata);
  }

  @Post('/agreements')
  @ApiEndpoint({
    description: 'Creates or deletes general ail agreement',
    statusCode: 200,
    responses: [{
      status: 200,
      description: 'General Ai agreement',
      type: AiAgreement,
    }],
  })
  async updateAiAgreements(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
      @Body() reqDto: UpdateAiAgreementsDto,
  ): Promise<AiAgreement[]> {
    return await this.service.updateAiAgreements(sessionMetadata, null, reqDto);
  }
}
