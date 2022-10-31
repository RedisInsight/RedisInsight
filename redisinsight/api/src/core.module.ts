import { Global, Module } from '@nestjs/common';
import { EncryptionModule } from 'src/modules/encryption/encryption.module';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { DatabaseModule } from 'src/modules/database/database.module';
import { CertificateModule } from 'src/modules/certificate/certificate.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from 'src/modules/redis/redis.module';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    EncryptionModule.register(),
    SettingsModule.register(),
    CertificateModule,
    DatabaseModule.register(),
    RedisModule,
  ],
  exports: [
    EncryptionModule,
    SettingsModule,
    CertificateModule,
    DatabaseModule,
    RedisModule,
  ],
})
export class CoreModule {}
