import { Test, TestingModule } from '@nestjs/testing';
import {
  mockEncryptionStrategy,
  mockEncryptResult,
  mockSettingsProvider,
  MockType,
} from 'src/__mocks__';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { PlainEncryptionStrategy } from 'src/modules/core/encryption/strategies/plain-encryption.strategy';
import { KeytarEncryptionStrategy } from 'src/modules/core/encryption/strategies/keytar-encryption.strategy';
import { EncryptionStrategy } from 'src/modules/core/encryption/models';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import { UnsupportedEncryptionStrategyException } from 'src/modules/core/encryption/exceptions';

describe('EncryptionService', () => {
  let service: EncryptionService;
  let plainEncryptionStrategy: MockType<PlainEncryptionStrategy>;
  let keytarEncryptionStrategy: MockType<KeytarEncryptionStrategy>;
  let settingsProvider: MockType<ISettingsProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: PlainEncryptionStrategy,
          useFactory: mockEncryptionStrategy,
        },
        {
          provide: KeytarEncryptionStrategy,
          useFactory: mockEncryptionStrategy,
        },
        {
          provide: 'SETTINGS_PROVIDER',
          useFactory: mockSettingsProvider,
        },
      ],
    }).compile();

    service = module.get(EncryptionService);
    plainEncryptionStrategy = module.get(PlainEncryptionStrategy);
    keytarEncryptionStrategy = module.get(KeytarEncryptionStrategy);
    settingsProvider = module.get('SETTINGS_PROVIDER');
  });

  describe('getAvailableEncryptionStrategies', () => {
    it('Should return list 2 strategies available', async () => {
      keytarEncryptionStrategy.isAvailable.mockResolvedValueOnce(true);

      expect(await service.getAvailableEncryptionStrategies()).toEqual([
        EncryptionStrategy.PLAIN,
        EncryptionStrategy.KEYTAR,
      ]);
    });
    it('Should return list with one strategy available', async () => {
      keytarEncryptionStrategy.isAvailable.mockResolvedValueOnce(false);

      expect(await service.getAvailableEncryptionStrategies()).toEqual([
        EncryptionStrategy.PLAIN,
      ]);
    });
  });

  describe('getEncryptionStrategy', () => {
    it('Should return KEYTAR strategy based on app agreements', async () => {
      settingsProvider.getSettings.mockResolvedValueOnce({
        agreements: { encryption: true },
      });

      expect(await service.getEncryptionStrategy()).toEqual(keytarEncryptionStrategy);
    });
    it('Should return PLAIN strategy based on app agreements', async () => {
      settingsProvider.getSettings.mockResolvedValueOnce({
        agreements: { encryption: false },
      });

      expect(await service.getEncryptionStrategy()).toEqual(plainEncryptionStrategy);
    });
    it('Should throw an error if encryption strategy was not set by user', async () => {
      settingsProvider.getSettings.mockResolvedValueOnce({
        agreements: { encryption: null },
      });

      await expect(service.getEncryptionStrategy()).rejects.toThrow(UnsupportedEncryptionStrategyException);
    });
  });

  describe('encrypt', () => {
    it('Should encrypt data and return proper response', async () => {
      settingsProvider.getSettings.mockResolvedValueOnce({
        agreements: { encryption: true },
      });
      keytarEncryptionStrategy.encrypt.mockResolvedValueOnce(mockEncryptResult);

      expect(await service.encrypt('string')).toEqual(mockEncryptResult);
    });
  });

  describe('decrypt', () => {
    it('Should return decrypted string', async () => {
      settingsProvider.getSettings.mockResolvedValueOnce({
        agreements: { encryption: true },
      });
      keytarEncryptionStrategy.decrypt.mockResolvedValueOnce(mockEncryptResult.data);

      expect(await service.decrypt('string', EncryptionStrategy.KEYTAR)).toEqual(mockEncryptResult.data);
    });
    it('Should return null when no data passed', async () => {
      expect(await service.decrypt(null, EncryptionStrategy.KEYTAR)).toEqual(null);
    });
  });
});
