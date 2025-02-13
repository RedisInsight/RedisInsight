import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicrosoftAuthService } from './microsoft-azure-auth.service';
import { MicrosoftAuthSessionRepository } from './repositories/microsoft-auth.session.repository';
import { LocalMicrosoftAuthSessionRepository } from './repositories/local.microsoft-auth.session.repository';
import { MicrosoftAuthSessionEntity } from './entities/microsoft-auth.session.entity';
import { MicrosoftAzureAuthController } from './microsoft-azure-auth.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([MicrosoftAuthSessionEntity])
    ],
    providers: [
        MicrosoftAuthService,
        {
            provide: MicrosoftAuthSessionRepository,
            useClass: LocalMicrosoftAuthSessionRepository,
        }
    ],
    controllers: [MicrosoftAzureAuthController],
    exports: [MicrosoftAuthService],
})
export class MicrosoftAuthModule { }