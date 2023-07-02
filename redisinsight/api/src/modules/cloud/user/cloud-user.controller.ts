import {
  ClassSerializerInterceptor,
  Controller, Get, Param, Post, Put, UseInterceptors, UsePipes, ValidationPipe
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudUserService } from 'src/modules/cloud/user/cloud-user.service';
import { CloudUser } from 'src/modules/cloud/user/models';

@ApiTags('Cloud')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudUserController {
  constructor(
    private readonly service: CloudUserService,
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

  @Get('/api-keys')
  @ApiEndpoint({
    description: 'Test endpoint will be removed',
    statusCode: 200,
    responses: [{ type: CloudUser }],
  })
  async g(
    @RequestSessionMetadata() sessionMetadata,
  ): Promise<any> {
    return this.service.generateCKeys(sessionMetadata);
  }

  @Post('/free-database')
  @ApiEndpoint({
    description: 'Test endpoint will be moved from here',
    statusCode: 200,
    responses: [{ type: CloudUser }],
  })
  async f(
    @RequestSessionMetadata() sessionMetadata,
  ): Promise<any> {
    return this.service.createFreeDatabase(sessionMetadata);
  }
}
