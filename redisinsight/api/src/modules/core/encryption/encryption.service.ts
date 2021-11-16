import { Inject, Injectable } from '@nestjs/common';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import { KeytarEncryptionStrategy } from 'src/modules/core/encryption/strategies/keytar-encryption.strategy';
import { PlainEncryptionStrategy } from 'src/modules/core/encryption/strategies/plain-encryption.strategy';
import { EncryptionResult, EncryptionStrategy } from 'src/modules/core/encryption/models';
import { IEncryptionStrategy } from 'src/modules/core/encryption/strategies/encryption-strategy.interface';
import {
  UnsupportedEncryptionStrategyException,
} from 'src/modules/core/encryption/exceptions';

@Injectable()
export class EncryptionService {
  constructor(
    @Inject('SETTINGS_PROVIDER')
    private readonly settingsProvider: ISettingsProvider,
    private readonly keytarEncryptionStrategy: KeytarEncryptionStrategy,
    private readonly plainEncryptionStrategy: PlainEncryptionStrategy,
  ) {}

  /**
   * Returns list of available encryption strategies
   * It is needed for users to choose one and save it in the app settings
   */
  async getAvailableEncryptionStrategies(): Promise<string[]> {
    const strategies = [
      EncryptionStrategy.PLAIN,
    ];

    if (await this.keytarEncryptionStrategy.isAvailable()) {
      strategies.push(EncryptionStrategy.KEYTAR);
    }

    return strategies;
  }

  /**
   * Get encryption strategy based on app settings
   * This strategy should be received from app settings but before it should be set by user.
   * As this settings is required we have to block any action that requires explicit user choice
   * so we will throw an error when encryption type is null
   */
  async getEncryptionStrategy(): Promise<IEncryptionStrategy> {
    const settings = await this.settingsProvider.getSettings();
    switch (settings.agreements?.encryption) {
      case true:
        return this.keytarEncryptionStrategy;
      case false:
        return this.plainEncryptionStrategy;
      default:
        throw new UnsupportedEncryptionStrategyException();
    }
  }

  /**
   * Encrypt data based on app encryption strategy
   * @param data
   */
  async encrypt(data: string): Promise<EncryptionResult> {
    const strategy = await this.getEncryptionStrategy();
    return strategy.encrypt(data);
  }

  /**
   * Try to decrypt data based on app encryption strategy
   * If data was encrypted before with strategy that is not match to the current one
   * it will be handled by the app encryption strategy
   * @param data
   * @param encryptedWith
   */
  async decrypt(data: string, encryptedWith: string): Promise<string | null> {
    // Nothing to decrypt. Should return null then
    if (!data) {
      return null;
    }

    const strategy = await this.getEncryptionStrategy();
    return strategy.decrypt(data, encryptedWith);
  }
}
