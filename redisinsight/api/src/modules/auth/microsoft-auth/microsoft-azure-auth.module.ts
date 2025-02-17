import { Module } from '@nestjs/common';
import { MicrosoftAuthService } from './microsoft-azure-auth.service';
import { MicrosoftAzureAuthController } from './microsoft-azure-auth.controller';

@Module({
    imports: [],
    providers: [
        MicrosoftAuthService,
    ],
    controllers: [MicrosoftAzureAuthController],
    exports: [MicrosoftAuthService],
})
export class MicrosoftAuthModule { }