import { Global, Module } from '@nestjs/common';
import { EncryptionModule } from 'src/modules/encryption/encryption.module';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { DatabaseModule } from 'src/modules/database/database.module';
import { CertificateModule } from 'src/modules/certificate/certificate.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    EncryptionModule.register(),
    SettingsModule.register(),
    CertificateModule,
    DatabaseModule,
  ],
  exports: [
    EncryptionModule,
    SettingsModule,
    CertificateModule,
    DatabaseModule,
  ],
})
export class CoreModule {}
