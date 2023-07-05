import {
  ClassSerializerInterceptor,
  Controller, Get, Param, Put, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudUser } from 'src/modules/cloud/user/models';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';

@ApiTags('Cloud User')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudUserController {
  constructor(
    private readonly service: CloudUserApiService,
  ) {}

  @Get('')
  @ApiEndpoint({
    description: 'Return user general info with accounts list',
    statusCode: 200,
    responses: [{ type: CloudUser }],
  })
  async me(@RequestSessionMetadata() sessionMetadata): Promise<CloudUser> {
    return this.service.me(sessionMetadata);
  }

  @Put('/accounts/:id/current')
  @ApiEndpoint({
    description: 'Activate user account',
    statusCode: 200,
    responses: [{ type: CloudUser }],
  })
  @ApiParam({ name: 'id', type: String })
  async setCurrentAccount(
    @Param('id') id,
      @RequestSessionMetadata() sessionMetadata,
  ): Promise<CloudUser> {
    return this.service.setCurrentAccount(sessionMetadata, id);
  }
}
