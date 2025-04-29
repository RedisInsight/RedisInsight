import { Controller, Get, Post, Param } from '@nestjs/common';
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

    @Post('logout/:databaseId')
    @ApiEndpoint({
        description: 'Logout from Microsoft authentication and delete the session',
        statusCode: 200,
    })
    async logout(
        @RequestSessionMetadata() sessionMetadata: SessionMetadata,
        @Param('databaseId') databaseId: string,
    ): Promise<void> {
        try {
            await this.microsoftAuthService.deleteSession(databaseId);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
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

    @Get('session/:databaseId')
    @ApiEndpoint({
        description: 'Return Microsoft authenticated user info for a specific database',
        statusCode: 200,
        responses: [{ type: MicrosoftAuthSessionData }],
    })
    async getSessionForDatabase(
        @RequestSessionMetadata() sessionMetadata: SessionMetadata,
        @Param('databaseId') databaseId: string,
    ) {
        try {
            const session = await this.microsoftAuthService.getSession(databaseId);

            if (!session) {
                return {
                    username: null,
                    displayName: null,
                    authenticated: false
                };
            }

            // Extract user info from the session
            return {
                username: session.account?.username || null,
                displayName: session.account?.name || null,
                authenticated: true,
                // Include additional fields that might be useful for the UI
                // Not currently used
                idTokenClaims: session.idTokenClaims || null,
                expiresOn: session.expiresOn || null
            };
        } catch (error) {
            return {
                username: null,
                displayName: null,
                authenticated: false,
                error: error.message || 'Failed to get Microsoft authentication session'
            };
        }
    }
}