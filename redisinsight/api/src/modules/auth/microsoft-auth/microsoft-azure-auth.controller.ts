import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { MicrosoftAuthService } from './microsoft-azure-auth.service';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { MicrosoftAuthSessionData } from './models/microsoft-auth-session.model';

@ApiTags('Microsoft Auth')
@Controller('auth/microsoft')
export class MicrosoftAzureAuthController {
    constructor(private readonly microsoftAuthService: MicrosoftAuthService) { }

    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            // TODO: Implement logout
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    @Get('me')
    @ApiEndpoint({
        description: 'Return Microsoft authenticated user info',
        statusCode: 200,
        responses: [{ type: MicrosoftAuthSessionData }],
    })
    async me(
        @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    ) {
        console.log('Microsoft Auth - me endpoint called');
        return this.microsoftAuthService.getSession();
    }
}