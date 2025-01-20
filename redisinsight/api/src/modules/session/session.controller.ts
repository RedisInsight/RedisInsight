import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata, Session } from 'src/common/models';
import { SessionService } from 'src/modules/session/session.service';

@ApiTags('Session')
@Controller('session')
export class SessionController {
  constructor(
    private service: SessionService,
  ) {
  }

  @Get('')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Get session',
    responses: [
      {
        status: 200,
        type: Session,
      },
    ],
  })
  async getSession(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<Session> {
    console.log('GET');
    return await this.service.getSession(sessionMetadata.sessionId);
  }
}
