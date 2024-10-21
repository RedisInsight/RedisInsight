import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post, Get,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { UpdateAiAgreementDto } from './dto/update.ai.agreement.dto';
import { AiAgreement } from './models/ai.agreement';
import { AiAgreementService } from './ai.agreement.service';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/agreements')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiAgreementsController {
  constructor(
    private readonly service: AiAgreementService,
  ) {}

  @Get()
  @ApiEndpoint({
    description: 'Get ai agreement',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ai agreement',
        type: AiAgreement,
      },
    ],
  })
  async getAiAgreement(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<AiAgreement> {
    return this.service.getAiAgreement(sessionMetadata);
  }

  @Post()
  @ApiEndpoint({
    description: 'Creates or updates ai agreement for account',
    statusCode: 200,
    responses: [{
      status: 200,
      description: 'Ai agreement',
      type: AiAgreement,
    }],
  })
  async saveAiAgreement(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
      @Body() dto: UpdateAiAgreementDto,
  ): Promise<AiAgreement> {
    return await this.service.saveAiAgreement(sessionMetadata, dto);
  }
}
