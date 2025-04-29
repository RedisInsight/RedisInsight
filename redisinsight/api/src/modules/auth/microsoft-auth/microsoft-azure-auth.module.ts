import { Module } from '@nestjs/common';
import { MicrosoftAuthService } from './microsoft-azure-auth.service';
import { MicrosoftAzureAuthController } from './microsoft-azure-auth.controller';
import { CloudSessionModule } from 'src/modules/cloud/session/cloud-session.module';
import { MicrosoftAuthStorageModule } from './microsoft-auth-storage.module';

@Module({
    imports: [
        CloudSessionModule.register(),
        MicrosoftAuthStorageModule,
    ],
    providers: [
        MicrosoftAuthService,
    ],
    controllers: [MicrosoftAzureAuthController],
    exports: [MicrosoftAuthService],
})
export class MicrosoftAuthModule { }