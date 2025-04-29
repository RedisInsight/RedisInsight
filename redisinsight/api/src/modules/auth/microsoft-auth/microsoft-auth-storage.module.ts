import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicrosoftAuthEntity } from './entities/microsoft-auth.entity';
import { MicrosoftAuthRepository } from './repositories/microsoft-auth.repository';
import { EncryptionModule } from 'src/modules/encryption/encryption.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([MicrosoftAuthEntity]),
    EncryptionModule,
  ],
  providers: [MicrosoftAuthRepository],
  exports: [MicrosoftAuthRepository],
})
export class MicrosoftAuthStorageModule {}