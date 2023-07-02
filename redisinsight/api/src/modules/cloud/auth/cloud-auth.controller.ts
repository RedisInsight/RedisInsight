import {
  Controller, Get, Post, Query, UsePipes, ValidationPipe, Render,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RequestSessionMetadata } from 'src/common/decorators';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import { CloudAuthIdpType } from 'src/modules/cloud/auth/models/cloud-auth-request';

@ApiTags('Cloud')
@Controller('cloud')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudAuthController {
  constructor(
    private readonly cloudAuthService: CloudAuthService,
  ) {}

  // todo: remove it is temporary
  @Post('oauth')
  @ApiEndpoint({
    description: 'Authenticate user using OAuth flow',
    statusCode: 200,
  })
  async oauth(
    @RequestSessionMetadata() sessionMetadata,
  ): Promise<string> {
    return this.cloudAuthService.oauth(sessionMetadata, CloudAuthIdpType.Google);
  }

  @Get('oauth/callback')
  @ApiEndpoint({
    description: 'OAuth callback',
    statusCode: 200,
  })
  @Render('cloud_oauth_callback')
  async callback(@Query() query) {
    return this.cloudAuthService.callbackWeb(query);
  }

  @Get('logout')
  @ApiEndpoint({
    description: 'Logout user',
    statusCode: 200,
  })
  async logout(@RequestSessionMetadata() sessionMetadata): Promise<void> {
    return this.cloudAuthService.logout(sessionMetadata);
  }
}
