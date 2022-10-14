import { Module, Type } from '@nestjs/common';
import { SettingsService } from 'src/modules/settings/settings.service';
import { SettingsController } from 'src/modules/settings/settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsAnalytics } from 'src/modules/settings/settings.analytics';
import { KeytarEncryptionStrategy } from 'src/modules/core/encryption/strategies/keytar-encryption.strategy';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { SettingsRepository } from 'src/modules/settings/repositories/settings.repository';
import { LocalSettingsRepository } from 'src/modules/settings/repositories/local.settings.repository';
import { AgreementsRepository } from 'src/modules/settings/repositories/agreements.repository';
import { LocalAgreementsRepository } from 'src/modules/settings/repositories/local.agreements.repository';

@Module({})
export class SettingsModule {
  static register(
    settingsRepository: Type<SettingsRepository> = LocalSettingsRepository,
    agreementsRepository: Type<AgreementsRepository> = LocalAgreementsRepository,
  ) {
    return {
      module: SettingsModule,
      imports: [
        TypeOrmModule.forFeature([
          SettingsEntity,
          AgreementsEntity,
        ]),
      ],
      controllers: [
        SettingsController,
      ],
      providers: [
        SettingsService,
        SettingsAnalytics,
        KeytarEncryptionStrategy,
        {
          provide: SettingsRepository,
          useClass: settingsRepository,
        },
        {
          provide: AgreementsRepository,
          useClass: agreementsRepository,
        },
      ],
      exports: [
        SettingsService,
      ],
    };
  }
}
