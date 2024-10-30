import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post, Get,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { AiDatabaseAgreement } from './models/ai.database.agreement';
import { AiDatabaseAgreementService } from './ai.database.agreement.service';
import { UpdateAiDatabaseAgreementDto } from './dto/update.ai.database.agreement.dto';

@ApiTags('AI')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('ai/:databaseId/agreements')
@UsePipes(new ValidationPipe({ transform: true }))
export class AiDatabaseAgreementsController {
  constructor(
    private readonly service: AiDatabaseAgreementService,
  ) {}

  @Get()
  @ApiEndpoint({
    description: 'Get ai database agreement',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ai database agreement',
        type: AiDatabaseAgreement,
      },
    ],
  })
  async getAiAgreement(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
      @Param('databaseId') databaseId: string,
  ): Promise<AiDatabaseAgreement> {
    return this.service.getAiDatabaseAgreement(sessionMetadata, databaseId);
  }

  @Post()
  @ApiEndpoint({
    description: 'Creates or updates ai database agreement for database and account',
    statusCode: 200,
    responses: [{
      status: 200,
      description: 'Ai database agreement',
      type: AiDatabaseAgreement,
    }],
  })
  async saveAiAgreement(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
      @Param('databaseId') databaseId: string,
      @Body() dto: UpdateAiDatabaseAgreementDto,
  ): Promise<AiDatabaseAgreement> {
    return await this.service.saveAiDatabaseAgreement(sessionMetadata, databaseId, dto);
  }
}
