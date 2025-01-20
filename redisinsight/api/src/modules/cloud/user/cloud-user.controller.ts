import {
  ClassSerializerInterceptor,
  Controller, Get, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { SessionMetadata } from 'src/common/models';
import { CloudUserService } from 'src/modules/cloud/user/cloud-user.service';
import { CloudUser } from './cloud-user.model';

@ApiTags('Cloud User')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me')
export class CloudUserController {
  constructor(
    private readonly service: CloudUserService,
  ) {}

  @Get('')
  @ApiEndpoint({
    description: 'Return general profile info',
    statusCode: 200,
    responses: [{ type: CloudUser }],
  })
  async me(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<CloudUser> {
    return this.service.get(sessionMetadata);
  }
}
